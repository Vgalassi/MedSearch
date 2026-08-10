import pandas as pd

df = pd.read_csv("./datasets/raw.csv")

unique_symptoms = set()

for symptoms in df["symptom_text"]:
    for symptom in symptoms.split(","):
        unique_symptoms.add(symptom.strip().lower())

print(f"Total de sintomas únicos: {len(unique_symptoms)}")

pd.DataFrame({
    "symptom_en": sorted(unique_symptoms)
}).to_csv(
    "unique_symptoms.csv",
    index=False
)