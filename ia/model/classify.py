import json
import sys
from pathlib import Path

import joblib
import torch
import torch.nn.functional as functional
from transformers import AutoModelForSequenceClassification, AutoTokenizer


MODEL_PATH = Path(__file__).resolve().parent.parent / "bert_model2"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH).to(device)
model.eval()
encoder = joblib.load(MODEL_PATH / "label_encoder.pkl")


def predict(symptoms: str) -> dict[str, object]:
    inputs = tokenizer(
        symptoms,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )
    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        output = model(**inputs)

    probabilities = functional.softmax(output.logits, dim=1)
    confidence, prediction = torch.max(probabilities, dim=1)
    speciality = encoder.inverse_transform(prediction.cpu().numpy())[0]
    return {"speciality": str(speciality), "confidence": float(confidence.item())}


def classify_request(request: dict[str, object]) -> dict[str, object]:
    symptoms = str(request.get("symptoms", "")).strip()
    if not symptoms:
        raise ValueError("Os sintomas devem ser informados.")
    return predict(symptoms)


def run_once() -> None:
    request = json.loads(sys.stdin.read())
    print(json.dumps(classify_request(request), ensure_ascii=False))


def run_worker() -> None:
    for line in sys.stdin:
        request_id = None
        try:
            request = json.loads(line)
            request_id = request.get("id")
            response = {"id": request_id, **classify_request(request)}
        except Exception as error:
            response = {"id": request_id, "error": str(error)}

        print(json.dumps(response, ensure_ascii=False), flush=True)


def main() -> None:
    if "--worker" in sys.argv:
        run_worker()
        return

    run_once()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
