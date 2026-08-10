
import pandas as pd


df = pd.read_csv("./datasets/raw.csv")


unique_diseases = sorted(df["diseases"].unique())

pd.DataFrame({
    "disease": unique_diseases
}).to_csv("unique_diseases.csv", index=False)