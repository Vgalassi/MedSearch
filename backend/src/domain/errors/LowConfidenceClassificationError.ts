export class LowConfidenceClassificationError extends Error {
  constructor() {
    super("Não foi possível determinar com precisão a especialidade.");
    this.name = "LowConfidenceClassificationError";
  }
}
