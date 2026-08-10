import pandas as pd

df = pd.read_csv("./datasets/dataset.csv")

print(df.head())

X = df["symptoms_pt"]
y = df["speciality"]


from sklearn.preprocessing import LabelEncoder

encoder = LabelEncoder()

y = encoder.fit_transform(y)


from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer()

X_train = vectorizer.fit_transform(X_train)

X_test = vectorizer.transform(X_test)


from sklearn.linear_model import LogisticRegression

model = LogisticRegression(
    max_iter=2000
)

model.fit(X_train, y_train)


from sklearn.metrics import classification_report

pred = model.predict(X_test)

print(classification_report(
    y_test,
    pred,
    target_names=encoder.classes_
))

from sklearn.metrics import confusion_matrix
from sklearn.metrics import ConfusionMatrixDisplay
import matplotlib.pyplot as plt

"""
ConfusionMatrixDisplay.from_predictions(
    y_test,
    pred,
    display_labels=encoder.classes_,
    xticks_rotation=90,
    cmap="Blues"
)

plt.figure(figsize=(20,20))
plt.show()
"""

def predict_speciality(text):

    text_vector = vectorizer.transform([text])

    prediction = model.predict(text_vector)

    speciality = encoder.inverse_transform(prediction)

    return speciality[0]


print(
    predict_speciality(
        "Estou com dor no joelho"
    )
)