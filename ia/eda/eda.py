
import pandas as pd

df = pd.read_csv("./datasets/raw.csv")



print("Informações de contagem \n")
print("Número de registros:", len(df))
print("Número de doenças:", df["diseases"].nunique())
print("\n\n\n")


print("Informações de estrutura")
print(df.head())
print(df.columns)
print(df.info())
print("\n\n")


print("Doenças duplicadas \n")
duplicates = df["diseases"].value_counts()

print(duplicates[duplicates > 1])

print("\n\n")


print("Sintomas")
symptom_columns = [c for c in df.columns if c.startswith("symptom_text")]

df["num_symptoms"] = (
    df[symptom_columns]
    .notna()
    .sum(axis=1)
)

print(df["num_symptoms"].describe())
print("\n\n")



print("Contagem de sintomas \n")
from collections import Counter

counter = Counter()

for col in symptom_columns:
    counter.update(df[col].dropna())


for symptom, count in counter.most_common(20):
    print(symptom, count)

    unique_symptoms = set()

print("\n\n")


for col in symptom_columns:
    unique_symptoms.update(df[col].dropna())

print(len(unique_symptoms))


print(df[df["num_symptoms"] <= 2])

