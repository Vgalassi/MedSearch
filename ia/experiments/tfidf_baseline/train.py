"""Experimento isolado: mesmo dataset/split de model/trainbert.py, sem pesos pre-treinados."""
import hashlib
import json
import platform
import time
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.exceptions import ConvergenceWarning
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder


def main():
    root = Path(__file__).resolve().parents[2]
    output = Path(__file__).resolve().parent / "results"
    output.mkdir(exist_ok=True)
    dataset = root / "datasets/dataset_augmented.csv"
    df = pd.read_csv(dataset)
    encoder = LabelEncoder()
    labels = encoder.fit_transform(df["speciality"])
    train_ids, test_ids = train_test_split(
        np.arange(len(df)), test_size=0.2, stratify=labels, random_state=42
    )
    texts = df["symptoms_pt"].astype(str)
    model = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("classifier", LogisticRegression(max_iter=2000, random_state=42)),
    ])
    print(f"Treinando: {len(train_ids)} exemplos; avaliacao: {len(test_ids)}; classes: {len(encoder.classes_)}", flush=True)
    started = time.perf_counter()
    with warnings.catch_warnings(record=True) as captured:
        warnings.simplefilter("always", ConvergenceWarning)
        model.fit(texts.iloc[train_ids], labels[train_ids])
    training_seconds = time.perf_counter() - started
    started = time.perf_counter()
    predicted = model.predict(texts.iloc[test_ids])
    prediction_seconds = time.perf_counter() - started
    actual = labels[test_ids]
    metrics = {
        "accuracy": accuracy_score(actual, predicted),
        "f1_weighted": f1_score(actual, predicted, average="weighted"),
        "f1_macro": f1_score(actual, predicted, average="macro"),
    }
    state_path = root / "bert_model2/checkpoint-28908/trainer_state.json"
    state = json.loads(state_path.read_text(encoding="utf-8"))
    best = next(item for item in state["log_history"] if item.get("step") == state["best_global_step"] and "eval_loss" in item)
    bert = {key: best[f"eval_{key}"] for key in metrics}
    overlap = int(texts.iloc[test_ids].isin(set(texts.iloc[train_ids])).sum())
    metadata = {
        "dataset": str(dataset.relative_to(root)),
        "dataset_sha256": hashlib.sha256(dataset.read_bytes()).hexdigest(),
        "examples": len(df), "train_examples": len(train_ids), "evaluation_examples": len(test_ids),
        "classes": encoder.classes_.tolist(), "random_state": 42, "test_size": 0.2,
        "python": platform.python_version(), "sklearn": sklearn.__version__,
        "numpy": np.__version__, "pandas": pd.__version__,
        "training_seconds": training_seconds, "prediction_seconds": prediction_seconds,
        "features": len(model.named_steps["tfidf"].vocabulary_),
        "iterations": model.named_steps["classifier"].n_iter_.tolist(),
        "warnings": [str(item.message) for item in captured],
        "evaluation_rows_with_exact_text_in_training": overlap,
        "baseline_metrics": metrics, "bert_recorded_metrics": bert,
        "bert_metrics_source": str(state_path.relative_to(root)),
        "bert_re_evaluated": False,
    }
    (output / "metrics.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")
    report = classification_report(actual, predicted, target_names=encoder.classes_, output_dict=True)
    pd.DataFrame(report).T.to_csv(output / "classification_report.csv", encoding="utf-8-sig")
    pd.DataFrame(confusion_matrix(actual, predicted), index=encoder.classes_, columns=encoder.classes_).to_csv(output / "confusion_matrix.csv", encoding="utf-8-sig")
    pd.DataFrame({"row_index": test_ids, "actual": encoder.inverse_transform(actual), "predicted": encoder.inverse_transform(predicted)}).to_csv(output / "predictions.csv", index=False, encoding="utf-8-sig")
    np.savez_compressed(output / "split_indices.npz", train=train_ids, evaluation=test_ids)
    joblib.dump({"pipeline": model, "label_encoder": encoder}, output / "model.joblib")
    rows = "\n".join(f"| {key} | {metrics[key]:.4%} | {bert[key]:.4%} | {(metrics[key] - bert[key])*100:+.4f} |" for key in metrics)
    summary = f"""# Experimento sem BERTimbau

TF-IDF de palavras + regressao logistica, sem pesos pre-treinados. Mesma abordagem de model/preproces.py, usando o dataset e a divisao de model/trainbert.py. Vetorizador ajustado somente no treino; sem busca de hiperparametros.

Dataset: {len(df)} exemplos, {len(encoder.classes_)} classes. Treino: {len(train_ids)}; avaliacao: {len(test_ids)}. Divisao estratificada 80/20, semente 42.

| Metrica | TF-IDF + regressao logistica | BERTimbau (registro existente) | Diferenca (pontos percentuais) |
|---|---:|---:|---:|
{rows}

Tempo de ajuste do baseline: {training_seconds:.2f} segundos. Previsao de toda a avaliacao: {prediction_seconds:.2f} segundos.

## Limites da comparacao

- O BERTimbau nao foi alterado nem reavaliado. Os valores sao do registro do melhor checkpoint existente. Nao ha hash historico que comprove que o CSV atual e identico ao usado naquela execucao.
- O BERTimbau usa essa divisao para escolher o melhor checkpoint; portanto, ela e validacao, nao teste final independente.
- {overlap} linhas de avaliacao possuem texto exatamente igual a algum texto de treino. O split foi mantido para comparabilidade; isso limita conclusoes sobre generalizacao.
- Este experimento compara duas abordagens. Nao isola apenas o efeito do pre-treinamento: para isso seria necessario treinar a mesma arquitetura BERT com pesos aleatorios.
- Os tempos sao desta execucao do baseline e nao constituem uma comparacao de velocidade com o BERTimbau.

Artefatos: metrics.json, classification_report.csv, confusion_matrix.csv, predictions.csv, split_indices.npz e model.joblib.
"""
    (output / "comparison.md").write_text(summary, encoding="utf-8")
    print(json.dumps(metadata, indent=2, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
