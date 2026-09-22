# MedSearch

O MedSearch é um projeto para busca e agendamento de consultas médicas. A plataforma conecta pacientes, médicos e clínicas, com gerenciamento de agendas, consultas presenciais e por videochamada, notificações e busca de especialidades a partir de sintomas com inteligência artificial.
O projeto utiliza Next.js e React no frontend, Node.js com Fastify e Prisma no backend, PostgreSQL como banco de dados e Python com um modelo BERT para classificação de sintomas.

## Pré-requisitos

- Node.js 22 (a partir de 22.12) ou 24, com npm.
- Docker com Docker Compose para executar o PostgreSQL.
- Python 3.10 ou superior, caso queira utilizar o assistente de sintomas.

## Como executar

Os comandos abaixo partem da raiz do repositório e usam PowerShell.

### 1. Instale as dependências

```powershell
npm --prefix backend ci
npm --prefix frontend ci
```

### 2. Configure o backend

Copie o arquivo de exemplo:

```powershell
Copy-Item backend/.env.example backend/.env
```

Em `backend/.env`, configure a conexão com o banco local e um segredo de sessão:

```dotenv
DATABASE_URL="postgresql://root:root@localhost:5432/backend?schema=public"
SESSION_SECRET="substitua-por-um-segredo-aleatorio"
```

Gere um segredo com o comando abaixo e copie o resultado para `SESSION_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

As credenciais do banco acima correspondem ao ambiente local definido no Docker Compose. O arquivo `.env` é ignorado pelo Git.

### 3. Prepare o banco de dados

Com o Docker em execução:

```powershell
docker compose up -d postgres
cd backend
npx prisma generate
npx prisma migrate deploy
```

Aguarde o PostgreSQL iniciar antes de aplicar as migrations. Opcionalmente, execute `npm run seed` na pasta `backend` para cadastrar clínicas, médicos e pacientes de demonstração.

### 4. Inicie a aplicação

Na pasta `backend`:

```powershell
npm run dev
```

Em outro terminal, a partir da raiz do projeto:

```powershell
cd frontend
npm run dev
```

Acesse **https://localhost:3001**. O backend atende em **https://localhost:3000**.

Os scripts geram automaticamente um certificado HTTPS local compartilhado. Como ele é autoassinado, abra os dois endereços no navegador e aceite o certificado para permitir a comunicação entre frontend e backend.

## Assistente de sintomas com IA

Para habilitar a busca por sintomas, instale as dependências Python a partir da raiz:

```powershell
py -m pip install -r ia/requirements.txt
```

Disponibilize o modelo treinado em `ia/bert_model2/`, incluindo `config.json`, `model.safetensors`, os arquivos do tokenizer e `label_encoder.pkl`. Os modelos e checkpoints não estão incluídos no repositório; é necessário obtê-los separadamente ou treiná-los. Sem esses arquivos, as demais funcionalidades podem ser executadas, mas a classificação de sintomas não funcionará.

O backend usa `py` por padrão. Para utilizar outro executável ou um ambiente virtual, defina `PYTHON_EXECUTABLE` em `backend/.env` com o caminho do Python que possui as dependências instaladas.
