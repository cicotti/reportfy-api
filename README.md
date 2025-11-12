# Reportfy API

API backend para o sistema Reportfy - Gerenciamento de Projetos SaaS.

## 🚀 Tecnologias

- **Fastify**: Framework web rápido e eficiente
- **TypeScript**: Tipagem estática para JavaScript
- **Supabase**: Backend-as-a-Service (autenticação, banco de dados, storage)
- **Vercel**: Plataforma de deployment

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta na Vercel (para deploy)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd reportfy-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
PORT=3000
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

```

## 🏃 Executando localmente

### Modo de desenvolvimento (com hot reload):
```bash
npm run dev
```

### Build para produção:
```bash
npm run build
npm start
```

## 📡 Endpoints da API

### Autenticação (`/api/auth`)
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/signup` - Registro de novo usuário
- `GET /api/auth/me` - Obter usuário atual (autenticado)
- `POST /api/auth/reset-password` - Resetar senha
- `POST /api/auth/update-password` - Atualizar senha (autenticado)

### Empresas (`/api/companies`)
- `GET /api/companies` - Listar empresas (autenticado)
- `POST /api/companies` - Criar empresa (autenticado)
- `PUT /api/companies/:id` - Atualizar empresa (autenticado)
- `DELETE /api/companies/:id` - Excluir empresa (autenticado)

### Clientes (`/api/clients`)
- `GET /api/clients` - Listar clientes (autenticado)
- `POST /api/clients` - Criar cliente (autenticado)
- `PUT /api/clients/:id` - Atualizar cliente (autenticado)
- `DELETE /api/clients/:id` - Excluir cliente (autenticado)

### Usuários (`/api/users`)
- `GET /api/users` - Listar usuários (autenticado)
- `PUT /api/users/:id` - Atualizar usuário (autenticado)
- `DELETE /api/users/:id` - Excluir usuário (autenticado)
- `POST /api/users/:id/role` - Atualizar função do usuário (autenticado)

### Projetos (`/api/projects`)
- `GET /api/projects` - Listar projetos (autenticado)
- `GET /api/projects/:id` - Obter projeto por ID (autenticado)
- `POST /api/projects` - Criar projeto (autenticado)
- `PUT /api/projects/:id` - Atualizar projeto (autenticado)
- `DELETE /api/projects/:id` - Excluir projeto (autenticado)

### Clima (`/api/weather`)
- `GET /api/weather/:projectId` - Obter clima do projeto (autenticado)
- `POST /api/weather/:projectId/sync` - Sincronizar clima via API (autenticado)

### Fotos (`/api/photos`)
- `GET /api/photos/:projectId` - Listar fotos do projeto (autenticado)
- `POST /api/photos/:projectId` - Upload de foto (autenticado, multipart/form-data)
- `DELETE /api/photos/:id` - Excluir foto (autenticado)

### Health Check
- `GET /health` - Verificar status da API

## 🔐 Autenticação

Todas as rotas protegidas requerem um token de autenticação no header:

```
Authorization: Bearer <seu_token>
```

O token é obtido após login bem-sucedido na rota `/api/auth/login`.

## 🌐 Deploy na Vercel

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Configure as variáveis de ambiente na Vercel:
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add ALLOWED_ORIGINS
```

4. Deploy:
```bash
vercel --prod
```

## 📁 Estrutura do Projeto

```
reportfy-api/
├── src/
│   ├── lib/
│   │   ├── errors.ts         # Classes de erro customizadas
│   │   ├── supabase.ts       # Configuração do Supabase
│   │   └── utils.ts          # Funções utilitárias
│   ├── middleware/
│   │   └── auth.ts           # Middleware de autenticação
│   ├── routes/
│   │   ├── auth.routes.ts    # Rotas de autenticação
│   │   ├── companies.routes.ts
│   │   ├── clients.routes.ts
│   │   ├── users.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── weather.routes.ts
│   │   └── photos.routes.ts
│   ├── services/
│   │   ├── auth.service.ts   # Lógica de negócio de autenticação
│   │   ├── companies.service.ts
│   │   ├── clients.service.ts
│   │   ├── users.service.ts
│   │   ├── projects.service.ts
│   │   ├── weather.service.ts
│   │   └── photos.service.ts
│   └── index.ts              # Entry point da aplicação
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json              # Configuração da Vercel
└── README.md
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.
