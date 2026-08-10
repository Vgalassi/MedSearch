import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { injectable } from "inversify";
import type {
  SymptomClassification,
  SymptomClassifier,
} from "../../app/protocols/SymptomClassifier";

type ClassifierOutput = SymptomClassification & { error?: string };

@injectable()
export class PythonSymptomClassifier implements SymptomClassifier {
  async classify(symptoms: string): Promise<SymptomClassification> {
    const currentDirectory = dirname(fileURLToPath(import.meta.url));
    const scriptPath = resolve(currentDirectory, "../../../../ia/model/classify.py");
    const executable = process.env.PYTHON_EXECUTABLE ?? "py";

    return new Promise((resolveClassification, reject) => {
      const process = spawn(executable, [scriptPath], { stdio: "pipe" });
      let stdout = "";
      let stderr = "";

      process.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      process.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      process.on("error", () => {
        reject(
          new Error(
            "Não foi possivel iniciar o classificador. Configure PYTHON_EXECUTABLE com um Python que possua torch, transformers e joblib.",
          ),
        );
      });
      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderr.trim() || "Falha ao classificar os sintomas."));
          return;
        }

        try {
          const result = JSON.parse(stdout) as ClassifierOutput;
          if (!result.speciality || typeof result.confidence !== "number") {
            throw new Error(result.error ?? "Resposta invalida do classificador.");
          }
          resolveClassification({
            speciality: result.speciality,
            confidence: result.confidence,
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Resposta invalida do classificador."));
        }
      });

      process.stdin.write(JSON.stringify({ symptoms }));
      process.stdin.end();
    });
  }
}
