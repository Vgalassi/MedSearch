import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createInterface, type Interface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { injectable } from "inversify";
import type {
  SymptomClassification,
  SymptomClassifier,
} from "../../app/protocols/SymptomClassifier";

type ClassifierResponse = Partial<SymptomClassification> & {
  id?: string;
  error?: string;
};

type PendingClassification = {
  resolve: (classification: SymptomClassification) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

@injectable()
export class PythonSymptomClassifier implements SymptomClassifier {
  private process: ChildProcessWithoutNullStreams | undefined;
  private output: Interface | undefined;
  private stderr = "";
  private readonly pending = new Map<string, PendingClassification>();

  async classify(symptoms: string): Promise<SymptomClassification> {
    const worker = this.getOrStartWorker();
    const id = randomUUID();
    const timeoutMs = Number(process.env.AI_CLASSIFIER_TIMEOUT_MS ?? 120_000);

    return new Promise((resolveClassification, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("O classificador excedeu o tempo limite de resposta."));
      }, timeoutMs);

      this.pending.set(id, { resolve: resolveClassification, reject, timeout });

      worker.stdin.write(`${JSON.stringify({ id, symptoms })}\n`, (error) => {
        if (!error) return;
        const request = this.pending.get(id);
        if (!request) return;

        clearTimeout(request.timeout);
        this.pending.delete(id);
        request.reject(new Error("Nao foi possivel enviar os sintomas ao classificador."));
      });
    });
  }

  shutdown(): void {
    const worker = this.process;
    if (!worker) return;

    this.process = undefined;
    this.output?.close();
    this.output = undefined;
    worker.kill();
    this.rejectPending(new Error("O classificador foi encerrado."));
  }

  private getOrStartWorker(): ChildProcessWithoutNullStreams {
    if (this.process && !this.process.killed) return this.process;

    const currentDirectory = dirname(fileURLToPath(import.meta.url));
    const scriptPath = resolve(currentDirectory, "../../../../ia/model/classify.py");
    const executable = process.env.PYTHON_EXECUTABLE ?? "py";
    const worker = spawn(executable, [scriptPath, "--worker"], { stdio: "pipe" });

    this.process = worker;
    this.stderr = "";
    this.output = createInterface({ input: worker.stdout });
    this.output.on("line", (line) => this.handleResponse(line));
    worker.stderr.on("data", (chunk: Buffer) => {
      this.stderr = `${this.stderr}${chunk.toString()}`.slice(-4000);
    });

    worker.on("error", () => {
      this.handleWorkerFailure(
        worker,
        "Nao foi possivel iniciar o classificador. Configure PYTHON_EXECUTABLE com um Python que possua torch, transformers e joblib.",
      );
    });
    worker.on("close", (code) => {
      this.handleWorkerFailure(
        worker,
        this.stderr.trim() || `O classificador foi encerrado com codigo ${code}.`,
      );
    });

    return worker;
  }

  private handleResponse(line: string): void {
    let response: ClassifierResponse;
    try {
      response = JSON.parse(line) as ClassifierResponse;
    } catch {
      return;
    }

    if (!response.id) return;
    const request = this.pending.get(response.id);
    if (!request) return;

    clearTimeout(request.timeout);
    this.pending.delete(response.id);

    if (response.error) {
      request.reject(new Error(response.error));
    } else if (response.speciality && typeof response.confidence === "number") {
      request.resolve({ speciality: response.speciality, confidence: response.confidence });
    } else {
      request.reject(new Error("Resposta invalida do classificador."));
    }
  }

  private handleWorkerFailure(worker: ChildProcessWithoutNullStreams, message: string): void {
    if (this.process !== worker) return;
    this.process = undefined;
    this.output?.close();
    this.output = undefined;
    this.rejectPending(new Error(message));
  }

  private rejectPending(error: Error): void {
    for (const request of this.pending.values()) {
      clearTimeout(request.timeout);
      request.reject(error);
    }
    this.pending.clear();
  }
}
