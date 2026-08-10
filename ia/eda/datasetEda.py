import pandas as pd

df = pd.read_csv("./datasets/dataset.csv")

speciality_count = df["speciality"].value_counts()

print(speciality_count)


distribution = (
    df["speciality"]
    .value_counts(normalize=True)
    .mul(100)
    .round(2)
)

print(distribution)

import matplotlib.pyplot as plt

speciality_count = df["speciality"].value_counts()

plt.figure(figsize=(12,6))

speciality_count.plot(kind="bar")

plt.title("Quantidade de exemplos por especialidade")
plt.xlabel("Especialidade")
plt.ylabel("Número de exemplos")

plt.xticks(rotation=60)

plt.tight_layout()
plt.show()


print("Número de especialidades:",
      df["speciality"].nunique())

print("Maior classe:",
      speciality_count.max())

print("Menor classe:",
      speciality_count.min())

print("Média:",
      speciality_count.mean())


diseases_per_speciality = (
    df.groupby("speciality")["diseases"]
      .nunique()
      .sort_values(ascending=False)
)

print(diseases_per_speciality)