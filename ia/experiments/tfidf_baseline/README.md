# Baseline sem BERTimbau

Experimento independente com TF-IDF e regressao logistica treinados do zero. Nao modifica o backend, os scripts originais ou os modelos BERT existentes.

Execute a partir da raiz do repositorio:

```powershell
uv run --no-project --with pandas --with scikit-learn --with joblib python ia/experiments/tfidf_baseline/train.py
```

Ou, em um Python com pandas, numpy, scikit-learn e joblib instalados:

```powershell
python ia/experiments/tfidf_baseline/train.py
```

O script resolve os caminhos pela propria localizacao. Reexecutar substitui somente os resultados deste experimento na pasta `results`.

Leia `results/comparison.md` para a comparacao e suas limitacoes. `results/metrics.json` registra versoes, hash do dataset, tempos, metricas e eventuais avisos de convergencia. Os indices do split, previsoes, matriz de confusao e relatorio por classe tambem sao salvos.

O arquivo `results/model.joblib` contem `pipeline` (vetorizador e classificador) e `label_encoder`. Para usar o modelo em um teste local:

```python
import joblib

artifact = joblib.load("ia/experiments/tfidf_baseline/results/model.joblib")
prediction = artifact["pipeline"].predict(["Estou com dor no joelho"])
print(artifact["label_encoder"].inverse_transform(prediction)[0])
```

A comparacao com BERTimbau usa suas metricas historicas, sem carregar ou alterar os pesos existentes. Este baseline nao equivale a treinar uma arquitetura BERT com pesos aleatorios.
