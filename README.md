# MedSearch

## Assistente de sintomas com IA

O endpoint `POST /ai/symptoms` e a pagina `/patient/ai` usam o classificador BERT local em `ia/bert_model`. O acesso e restrito a sessoes com perfil `PATIENT`.

Antes de iniciar o backend, instale um Python 3 com as dependencias do modelo:

```bash
python -m pip install -r ia/requirements.txt
```

O backend usa `py` como executavel padrao do Python. Caso precise usar outro executavel, defina `PYTHON_EXECUTABLE` antes de iniciar o backend. Exemplo no PowerShell:

```powershell
$env:PYTHON_EXECUTABLE = "C:\\caminho\\para\\python.exe"
```
