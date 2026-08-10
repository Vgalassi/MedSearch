import pandas as pd
import random
import re



DATASET_PATH = "./datasets/dataset2.csv"
TRANSLATED_PATH = "./datasets/translated_2.csv"
OUTPUT_PATH = "./datasets/dataset_augmented.csv"

# Probabilidades
PROB_ORIGINAL = 0.60
PROB_SINONIMO_1 = 0.20
PROB_SINONIMO_2 = 0.20


random.seed(42)




df = pd.read_csv(DATASET_PATH)

translations = pd.read_csv(TRANSLATED_PATH)

print("Dataset principal:")
print(df.head())

print("\nDataset de sintomas:")
print(translations.head())




symptom_dict = {}

for _, row in translations.iterrows():

    original = str(row["symptom_pt"]).strip()

    synonym1 = row["sympton_pt2"]
    synonym2 = row["sympton_pt3"]

    # Converte NaN para None
    if pd.isna(synonym1):
        synonym1 = None
    else:
        synonym1 = str(synonym1).strip()

    if pd.isna(synonym2):
        synonym2 = None
    else:
        synonym2 = str(synonym2).strip()

    symptom_dict[original] = {
        "original": original,
        "synonym1": synonym1,
        "synonym2": synonym2
    }


print("\nQuantidade de sintomas cadastrados:",
      len(symptom_dict))



def choose_variant(symptom):

    data = symptom_dict.get(symptom)

    # Se não encontrou o sintoma
    if data is None:
        return symptom

    choices = [
        data["original"],
        data["synonym1"],
        data["synonym2"]
    ]

    
    choices = [
        value for value in choices
        if value is not None and value != ""
    ]

   
    if len(choices) == 1:
        return choices[0]

   
    if len(choices) == 3:

        return random.choices(
            choices,
            weights=[
                PROB_ORIGINAL,
                PROB_SINONIMO_1,
                PROB_SINONIMO_2
            ],
            k=1
        )[0]

  
    return random.choice(choices)




def augment_symptoms(symptoms):

    if pd.isna(symptoms):
        return symptoms

    symptoms = str(symptoms)

    # Os sintomas estão separados por vírgula
    symptom_list = [
        symptom.strip()
        for symptom in symptoms.split(",")
    ]

    new_symptoms = []

    for symptom in symptom_list:

        new_symptom = choose_variant(symptom)

        new_symptoms.append(new_symptom)

    return ", ".join(new_symptoms)



print("\nAplicando substituições...")

df["symptoms_pt"] = df["symptoms_pt"].apply(
    augment_symptoms
)




df.to_csv(
    OUTPUT_PATH,
    index=False,
    encoding="utf-8-sig"
)

print("\nDataset salvo em:")
print(OUTPUT_PATH)



print("\nExemplos:")

for i in range(10):

    print("\nOriginal:")
    print(df.iloc[i]["symptoms_pt"])

print("\nProcessamento concluído!")