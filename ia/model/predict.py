import torch
import joblib

from transformers import AutoTokenizer
from transformers import AutoModelForSequenceClassification

MODEL_PATH = "./bert_model"

# Dispositivo
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Carrega o tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

# Carrega o modelo
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.to(device)
model.eval()

# Carrega o LabelEncoder
encoder = joblib.load(f"{MODEL_PATH}/label_encoder.pkl")


import torch.nn.functional as F

def predict(text):

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    inputs = {
        k: v.to(device)
        for k, v in inputs.items()
    }

    with torch.no_grad():
        outputs = model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)

    confidence, prediction = torch.max(probs, dim=1)

    speciality = encoder.inverse_transform(
        prediction.cpu().numpy()
    )[0]

    return speciality, confidence.item()


print(
    predict(
        "Tenho tosse seca e falta de ar."
    ),

    predict(
        "Estou urinando com dor."
    ),

    predict(
        "HIHIH jhaahahah bolas boa velgo"
    ),
    
    predict(
        "Tenho dor abdominal intensa."
    ),
    
    predict(
        "estou com dor de barriga "
    ),
    predict(
        "estou com dor de barriga "
    ),
    predict(
        "Tenho dor de cabeça há três dias."
    ),
    predict(
        "Meu olho está vermelho"
    ),
    predict(
        "Sinto muita tontura."
    )
    ,
    predict("estou com dor no pé")
    ,
    predict(
        "Estou com febre, dor de cabeça e nariz congestionado"
    )
)


print(
"Estou sentindo uma dor muito forte na região lombar",
predict("Estou sentindo uma dor muito forte na região lombar"),
"\n",
"Minha visão está ficando embaçada",
predict("Minha visão está ficando embaçada"),
"\n",
"Estou com uma pressão estranha no peito",
predict("Estou com uma pressão estranha no peito"),
"\n",
"Sinto dificuldade para puxar o ar",
predict("Sinto dificuldade para puxar o ar"),
"\n",
"Minha pele começou a coçar bastante",
predict("Minha pele começou a coçar bastante"),
"\n",
"Estou tendo muita dor na articulação do joelho",
predict("Estou tendo muita dor na articulação do joelho"),
"\n",
"Estou urinando muitas vezes durante a noite",
predict("Estou urinando muitas vezes durante a noite"),
"\n",
"Estou sentindo uma queimação no estômago",
predict("Estou sentindo uma queimação no estômago"),
"\n",
"Estou com dor de barriga",
predict("Estou com dor de barriga"),
"Estou com dor na parte de baixo da barriga",
predict("Estou com dor na parte de baixo da barriga")
)


MODEL_PATH = "./bert_model2"

# Dispositivo
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Carrega o tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

# Carrega o modelo
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.to(device)
model.eval()

# Carrega o LabelEncoder
encoder = joblib.load(f"{MODEL_PATH}/label_encoder.pkl")


print("Modelo 2")


print(
"Estou sentindo uma dor muito forte na região lombar",
predict("Estou sentindo uma dor muito forte na região lombar"),
"\n",
"Minha visão está ficando embaçada",
predict("Minha visão está ficando embaçada"),
"\n",
"Estou com uma pressão estranha no peito",
predict("Estou com uma pressão estranha no peito"),
"\n",
"Sinto dificuldade para puxar o ar",
predict("Sinto dificuldade para puxar o ar"),
"\n",
"Minha pele começou a coçar bastante",
predict("Minha pele começou a coçar bastante"),
"\n",
"Estou tendo muita dor na articulação do joelho",
predict("Estou tendo muita dor na articulação do joelho"),
"\n",
"Estou urinando muitas vezes durante a noite",
predict("Estou urinando muitas vezes durante a noite"),
"\n",
"Estou sentindo uma queimação no estômago",
predict("Estou sentindo uma queimação no estômago"),
"\n",
"Estou com dor de barriga",
predict("Estou com dor de barriga"),
"\n",
"Estou com dor na parte de baixo da barriga",
predict("Estou com dor na parte de baixo da barriga")
)



