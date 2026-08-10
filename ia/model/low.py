import os
os.environ["HF_HUB_DISABLE_XET"] = "1"

import joblib
import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report
)

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
    EarlyStoppingCallback
)

# =====================================================
# Dataset
# =====================================================

df = pd.read_csv("./datasets/dataset.csv")

X = df["symptoms_pt"].astype(str)
y = df["speciality"]

encoder = LabelEncoder()
y = encoder.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# =====================================================
# Modelo
# =====================================================

MODEL_NAME = "neuralmind/bert-base-portuguese-cased"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(encoder.classes_)
)

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

model.to(device)

print("=" * 60)
print("PyTorch:", torch.__version__)
print("CUDA:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

print("=" * 60)

# =====================================================
# Tokenização
# =====================================================

train_encodings = tokenizer(
    X_train.tolist(),
    truncation=True,
    max_length=128
)

test_encodings = tokenizer(
    X_test.tolist(),
    truncation=True,
    max_length=128
)

# =====================================================
# Dataset PyTorch
# =====================================================

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
            int(self.labels[idx])
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

# Padding dinâmico

data_collator = DataCollatorWithPadding(
    tokenizer=tokenizer
)

# =====================================================
# Métricas
# =====================================================

def compute_metrics(eval_pred):

    logits, labels = eval_pred

    predictions = np.argmax(
        logits,
        axis=1
    )

    return {
        "accuracy": accuracy_score(
            labels,
            predictions
        ),
        "f1_weighted": f1_score(
            labels,
            predictions,
            average="weighted"
        ),
        "f1_macro": f1_score(
            labels,
            predictions,
            average="macro"
        )
    }

# =====================================================
# Configuração
# =====================================================

training_args = TrainingArguments(

    output_dir="./bert_model",

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

    save_total_limit=2
)

# =====================================================
# Trainer
# =====================================================

trainer = Trainer(

    model=model,

    args=training_args,

    train_dataset=train_dataset,

    eval_dataset=test_dataset,


    data_collator=data_collator,

    compute_metrics=compute_metrics,

    callbacks=[
        EarlyStoppingCallback(
            early_stopping_patience=2
        )
    ]
)

# =====================================================
# Treinamento
# =====================================================

trainer.train()

trainer.save_state()

print("\nTreinamento finalizado!")

# =====================================================
# Avaliação
# =====================================================

metrics = trainer.evaluate()

print(metrics)

predictions = trainer.predict(
    test_dataset
)

y_pred = np.argmax(
    predictions.predictions,
    axis=1
)

print(
    classification_report(
        y_test,
        y_pred,
        target_names=encoder.classes_
    )
)

# =====================================================
# Salvar
# =====================================================

trainer.save_model("./bert_model")

tokenizer.save_pretrained("./bert_model")

joblib.dump(
    encoder,
    "./bert_model/label_encoder.pkl"
)

print("\nModelo salvo!")

# =====================================================
# Predição
# =====================================================

model.eval()

def predict(text, top_k=3):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=128
    )

    inputs = {
        k: v.to(device)
        for k, v in inputs.items()
    }

    with torch.no_grad():

        outputs = model(**inputs)

        probs = F.softmax(
            outputs.logits,
            dim=1
        )[0]

    values, indices = torch.topk(
        probs,
        top_k
    )

    results = []

    for value, index in zip(values, indices):

        speciality = encoder.inverse_transform(
            [index.cpu().item()]
        )[0]

        results.append(
            (
                speciality,
                value.item()
            )
        )

    return results

# =====================================================
# Testes
# =====================================================

tests = [
    "Estou com dor no joelho",
    "Estou com muita dor no peito e falta de ar",
    "Minha pele está cheia de manchas vermelhas",
    "Estou enxergando tudo embaçado",
    "Tenho muita ansiedade e insônia"
]

for text in tests:

    print(f"\n{text}")

    for speciality, confidence in predict(text):

        print(
            f"{speciality:30} {confidence*100:.2f}%"
        )