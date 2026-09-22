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

## HTTPS local

Backend e frontend compartilham um certificado HTTPS local, gerado automaticamente em `backend/certs` e ignorado pelo Git.

Para compilar o backend em `backend/dist` e iniciar a versão compilada:

```powershell
cd backend
npm run build
npm start
```

O backend fica disponível em `https://localhost:3000` e o WebSocket em `wss://localhost:3000/ws`.

Em outro terminal, inicie o frontend:

```powershell
cd frontend
npm run dev
```

O frontend fica disponível em `https://localhost:3001`. Como o certificado é autoassinado e destinado somente ao desenvolvimento, o navegador pode solicitar sua confirmação na primeira abertura. Em produção, use certificados emitidos por uma autoridade confiável e um proxy HTTPS.
