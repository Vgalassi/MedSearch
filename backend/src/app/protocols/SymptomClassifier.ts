export type SymptomClassification = {
  speciality: string;
  confidence: number;
};

export interface SymptomClassifier {
  classify(symptoms: string): Promise<SymptomClassification>;
  shutdown?(): void;
}
