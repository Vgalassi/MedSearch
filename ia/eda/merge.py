import pandas as pd


df_symptoms = pd.read_csv("./datasets/dataset_pt.csv")
df_speciality = pd.read_csv("./datasets/speciality.csv")


df_final = df_symptoms.merge(
    df_speciality,
    left_on="diseases",
    right_on="disease",
    how="left"
)


df_final = df_final.drop(columns=["disease"])

# salvar
df_final.to_csv(
    "diseases_symptoms_speciality.csv",
    index=False
)

print(df_final.head())