import os

# Evita problemas com Xet/Hugging Face no Windows
os.environ["HF_HUB_DISABLE_XET"] = "1"

import joblib
import numpy as np
import pandas as pd
import torch

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, classification_report

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)


# ============================================================
# 1. CARREGAR DATASET
# ============================================================

df = pd.read_csv("./datasets/dataset_augmented.csv")

print("=" * 60)
print("Dataset carregado")
print("Quantidade de exemplos:", len(df))
print("Quantidade de especialidades:", df["speciality"].nunique())
print("=" * 60)


# ============================================================
# 2. X E Y
# ============================================================

X = df["symptoms_pt"].astype(str)
y = df["speciality"]


# ============================================================
# 3. ENCODER DAS ESPECIALIDADES
# ============================================================

encoder = LabelEncoder()

y = encoder.fit_transform(y)

print("\nEspecialidades:")
for i, speciality in enumerate(encoder.classes_):
    print(i, "->", speciality)

print("\nTotal de classes:", len(encoder.classes_))


# ============================================================
# 4. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

print("\nDados:")
print("Treinamento:", len(X_train))
print("Teste:", len(X_test))


# ============================================================
# 5. MODELO BERT
# ============================================================

MODEL_NAME = "neuralmind/bert-base-portuguese-cased"

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

num_labels = len(encoder.classes_)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=num_labels
)


# ============================================================
# 6. GPU
# ============================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

model.to(device)

print("\n" + "=" * 60)
print("INFORMAÇÕES DO SISTEMA")
print("=" * 60)

print("PyTorch:", torch.__version__)
print("CUDA disponível:", torch.cuda.is_available())

if torch.cuda.is_available():

    print("GPU:", torch.cuda.get_device_name(0))
    print(
        "Memória GPU:",
        round(
            torch.cuda.get_device_properties(0).total_memory / 1024**3,
            2
        ),
        "GB"
    )

else:

    print("Treinamento será feito na CPU")

print("=" * 60)


# ============================================================
# 7. TOKENIZAÇÃO
# ============================================================

print("\nTokenizando dados...")

train_encodings = tokenizer(
    X_train.tolist(),
    truncation=True,
    padding=True,
    max_length=128
)

test_encodings = tokenizer(
    X_test.tolist(),
    truncation=True,
    padding=True,
    max_length=128
)


# ============================================================
# 8. DATASET DO PYTORCH
# ============================================================

class SymptomsDataset(torch.utils.data.Dataset):

    def __init__(self, encodings, labels):

        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):

        item = {
            key: torch.tensor(val[idx])
            for key, val in self.encodings.items()
        }

        item["labels"] = torch.tensor(
            int(self.labels[idx]),
            dtype=torch.long
        )

        return item

    def __len__(self):

        return len(self.labels)


train_dataset = SymptomsDataset(
    train_encodings,
    y_train
)

test_dataset = SymptomsDataset(
    test_encodings,
    y_test
)


# ============================================================
# 9. MÉTRICAS
# ============================================================

def compute_metrics(eval_pred):

    logits, labels = eval_pred

    predictions = np.argmax(
        logits,
        axis=1
    )

    accuracy = accuracy_score(
        labels,
        predictions
    )

    f1_weighted = f1_score(
        labels,
        predictions,
        average="weighted"
    )

    f1_macro = f1_score(
        labels,
        predictions,
        average="macro"
    )

    return {

        "accuracy": accuracy,

        "f1_weighted": f1_weighted,

        "f1_macro": f1_macro
    }


# ============================================================
# 10. CONFIGURAÇÃO DO TREINAMENTO
# ============================================================

training_args = TrainingArguments(

    output_dir="./bert_model2",

    eval_strategy="epoch",

    save_strategy="epoch",

    learning_rate=2e-5,

    per_device_train_batch_size=16,

    per_device_eval_batch_size=16,

    num_train_epochs=3,

    weight_decay=0.01,

    warmup_ratio=0.1,

    max_grad_norm=1.0,

    logging_steps=100,

    load_best_model_at_end=True,

    metric_for_best_model="eval_loss",

    greater_is_better=False,

    save_total_limit=2,

    report_to="none"
)


# ============================================================
# 11. TRAINER
# ============================================================

trainer = Trainer(

    model=model,

    args=training_args,

    train_dataset=train_dataset,

    eval_dataset=test_dataset,

    compute_metrics=compute_metrics
)


# ============================================================
# 12. TREINAMENTO
# ============================================================

print("\n" + "=" * 60)
print("INICIANDO TREINAMENTO")
print("=" * 60)

trainer.train()

print("\nTreinamento finalizado!")


# ============================================================
# 13. AVALIAÇÃO
# ============================================================

print("\n" + "=" * 60)
print("AVALIAÇÃO")
print("=" * 60)

metrics = trainer.evaluate()

print(metrics)


# ============================================================
# 14. CLASSIFICATION REPORT
# ============================================================

predictions = trainer.predict(
    test_dataset
)

pred = np.argmax(
    predictions.predictions,
    axis=1
)

print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        pred,
        target_names=encoder.classes_,
        digits=4
    )
)


# ============================================================
# 15. SALVAR MODELO
# ============================================================

print("\n" + "=" * 60)
print("SALVANDO MODELO")
print("=" * 60)

trainer.save_model(
    "./bert_model2"
)

tokenizer.save_pretrained(
    "./bert_model2"
)

joblib.dump(
    encoder,
    "./bert_model2/label_encoder.pkl"
)

print("Modelo salvo em:")
print("./bert_model2")


# ============================================================
# 16. PREDIÇÃO
# ============================================================

import torch.nn.functional as F

model.eval()


def predict(text, top_k=3):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.no_grad():

        outputs = model(**inputs)

        probabilities = F.softmax(
            outputs.logits,
            dim=1
        )

    probabilities = probabilities[0]

    values, indices = torch.topk(
        probabilities,
        k=top_k
    )

    results = []

    for value, index in zip(values, indices):

        speciality = encoder.inverse_transform(
            [index.item()]
        )[0]

        results.append(
            (
                speciality,
                value.item()
            )
        )

    return results


# ============================================================
# 17. TESTES
# ============================================================

tests = [

    "Estou com dor no joelho",

    "Estou com muita dor no peito e falta de ar",

    "Minha pele está cheia de manchas vermelhas",

    "Estou enxergando tudo embaçado",

    "Tenho muita ansiedade e insônia",

    "Estou com uma dor forte nas costas",

    "Estou com dificuldade para respirar",

    "Estou com dor de ouvido",

]


print("\n" + "=" * 60)
print("TESTES")
print("=" * 60)


for text in tests:

    results = predict(
        text,
        top_k=3
    )

    print("\n" + text)

    for speciality, confidence in results:

        print(
            f"{speciality:<30} "
            f"{confidence * 100:.2f}%"
        )

