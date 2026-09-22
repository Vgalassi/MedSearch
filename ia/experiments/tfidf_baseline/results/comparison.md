# Experimento sem BERTimbau

TF-IDF de palavras + regressao logistica, sem pesos pre-treinados. Mesma abordagem de model/preproces.py, usando o dataset e a divisao de model/trainbert.py. Vetorizador ajustado somente no treino; sem busca de hiperparametros.

Dataset: 192715 exemplos, 24 classes. Treino: 154172; avaliacao: 38543. Divisao estratificada 80/20, semente 42.

| Metrica | TF-IDF + regressao logistica | BERTimbau (registro existente) | Diferenca (pontos percentuais) |
|---|---:|---:|---:|
| accuracy | 95.3922% | 97.3251% | -1.9329 |
| f1_weighted | 95.3731% | 97.3215% | -1.9484 |
| f1_macro | 93.8890% | 96.3970% | -2.5080 |

Tempo de ajuste do baseline: 12.32 segundos. Previsao de toda a avaliacao: 0.43 segundos.

## Limites da comparacao

- O BERTimbau nao foi alterado nem reavaliado. Os valores sao do registro do melhor checkpoint existente. Nao ha hash historico que comprove que o CSV atual e identico ao usado naquela execucao.
- O BERTimbau usa essa divisao para escolher o melhor checkpoint; portanto, ela e validacao, nao teste final independente.
- 610 linhas de avaliacao possuem texto exatamente igual a algum texto de treino. O split foi mantido para comparabilidade; isso limita conclusoes sobre generalizacao.
- Este experimento compara duas abordagens. Nao isola apenas o efeito do pre-treinamento: para isso seria necessario treinar a mesma arquitetura BERT com pesos aleatorios.
- Os tempos sao desta execucao do baseline e nao constituem uma comparacao de velocidade com o BERTimbau.

Artefatos: metrics.json, classification_report.csv, confusion_matrix.csv, predictions.csv, split_indices.npz e model.joblib.
