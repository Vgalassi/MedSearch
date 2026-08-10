import pandas as pd

# Dataset original
df = pd.read_csv("./datasets/raw.csv")

# Dicionário de tradução
translations = pd.read_csv(
    "./datasets/translated.csv",
)

translation_dict = dict(
    zip(
        translations["symptom_en"].str.strip().str.lower(),
        translations["symptom_pt"]
    )
)

def translate_symptoms(symptom_text):
    translated = []

    for symptom in symptom_text.split(","):
        symptom = symptom.strip().lower()

        translated.append(
            translation_dict.get(symptom, symptom)
        )

    return ", ".join(translated)


df["symptoms_pt"] = df["symptom_text"].apply(translate_symptoms)

df.to_csv(
    "./datasets/dataset_pt.csv",
    index=False,
    encoding="utf-8-sig"
)