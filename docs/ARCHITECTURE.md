# Arquitetura Reportfy - Separação Front-end e Back-end

## 📋 Resumo

A aplicação Reportfy foi reestruturada para separar completamente o front-end do back-end, seguindo uma arquitetura moderna de microserviços.

## 🏗️ Arquitetura Atual

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                             │
│                    (Navegador Web)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
        ┌────────────────┴──────────────────┐
        │                                   │
        ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   FRONT-END      │              │   BACK-END       │
│  React + Vite    │◄────────────►│  Fastify API     │
│   (Vercel)       │   REST API   │   (Vercel)       │
└──────────────────┘              └────────┬─────────┘
                                           │
                                           │
                                           ▼
                                  ┌────────────────┐
                                  │   SUPABASE     │
                                  │ - Auth         │
                                  │ - Database     │
                                  │ - Storage      │
                                  └────────────────┘
```

## 📁 Estrutura de Projetos

### Front-end (`saas-boilerplate/`)
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: React Query (TanStack Query)
- **Deploy**: Vercel

### Back-end (`reportfy-api/`)
- **Framework**: Fastify + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Deploy**: Vercel Serverless

## 🔐 Fluxo de Autenticação

1. **Login**:
   ```
   Cliente → API (/api/auth/login) → Supabase Auth → Retorna JWT
   ```

2. **Requisições Autenticadas**:
   ```
   Cliente → API (Header: Authorization: Bearer <JWT>) → Valida Token → Executa Operação → Retorna Dados
   ```

## 🛣️ Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Registro
- `GET /api/auth/me` - Usuário atual
- `POST /api/auth/reset-password` - Reset de senha
- `POST /api/auth/update-password` - Atualizar senha

### Gerenciamento SaaS
- `GET/POST/PUT/DELETE /api/companies` - Empresas
- `GET/POST/PUT/DELETE /api/clients` - Clientes  
- `GET/PUT/DELETE /api/users` - Usuários
- `POST /api/users/:id/role` - Atualizar papel do usuário

### Projetos e Recursos
- `GET/POST/PUT/DELETE /api/projects` - Projetos
- `GET/POST /api/weather/:projectId` - Clima do projeto
- `POST /api/weather/:projectId/sync` - Sincronizar clima
- `GET/POST/DELETE /api/photos/:projectId` - Fotos do projeto

## 🔄 Schemas do Banco de Dados

### Schema `saas`
- `companies` - Empresas
- `profiles` - Perfis de usuários
- `user_roles` - Papéis dos usuários
- `clients` - Clientes das empresas

### Schema `public`
- `projects` - Projetos
- `project_tasks` - Tarefas dos projetos (WBS)
- `project_weathers` - Clima dos projetos
- `project_photos` - Fotos dos projetos
- `informative_types` - Tipos de informativos
- `project_informatives` - Informativos dos projetos

## 🚀 Deployment

### Front-end (Vercel)
```bash
# No diretório saas-boilerplate/
vercel --prod
```

**Variáveis de Ambiente:**
```env
VITE_API_URL=https://sua-api.vercel.app/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=xxx
```

### Back-end (Vercel)
```bash
# No diretório reportfy-api/
vercel --prod
```

**Variáveis de Ambiente:**
```env
ALLOWED_ORIGINS=https://seu-frontend.vercel.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

## 🔧 Desenvolvimento Local

### 1. Iniciar a API
```bash
cd reportfy-api
npm install
npm run dev
# API rodando em http://localhost:3000
```

### 2. Iniciar o Front-end
```bash
cd saas-boilerplate
npm install
npm run dev
# Front-end rodando em http://localhost:5173
```

## 📊 Benefícios da Nova Arquitetura

### Segurança
- ✅ Credenciais do Supabase não expostas no front-end
- ✅ Lógica de negócio protegida no back-end
- ✅ Validação centralizada de permissões
- ✅ RLS (Row Level Security) mantido no Supabase como camada adicional

### Escalabilidade
- ✅ Front-end e back-end podem escalar independentemente
- ✅ Cache pode ser implementado na API
- ✅ Rate limiting centralizado
- ✅ Fácil adicionar novos clientes (mobile, desktop)

### Manutenibilidade
- ✅ Separação clara de responsabilidades
- ✅ Código organizado por domínio
- ✅ TypeScript em todo o stack
- ✅ Documentação centralizada

### Performance
- ✅ Menos chamadas diretas ao Supabase
- ✅ Possibilidade de agregação de dados na API
- ✅ Controle fino sobre queries
- ✅ Deploy otimizado para Vercel (serverless)

## 🎯 Próximos Passos

### Fase 1 - Migração do Front-end ⏳
1. Criar cliente HTTP (`src/lib/api.ts`)
2. Adaptar serviços para usar a API
3. Atualizar hooks do React Query
4. Testar todas as funcionalidades
5. Deploy coordenado

### Fase 2 - Otimizações 🔜
1. Implementar cache (Redis)
2. Adicionar rate limiting
3. Logging e monitoring (Sentry)
4. Testes automatizados (Jest/Vitest)
5. CI/CD pipeline

### Fase 3 - Novas Funcionalidades 🚀
1. WebSockets para atualizações em tempo real
2. Relatórios em PDF
3. Exportação de dados
4. Integrações com terceiros
5. API pública documentada (Swagger/OpenAPI)

## 📝 Checklist de Migração

### Back-end (Completo ✅)
- [x] Configurar projeto Fastify
- [x] Implementar autenticação JWT
- [x] Migrar serviços SaaS (auth, companies, clients, users)
- [x] Migrar serviços de projetos
- [x] Migrar serviços de clima
- [x] Migrar serviços de fotos
- [x] Configurar CORS
- [x] Configurar upload de arquivos
- [x] Criar vercel.json
- [x] Documentação da API

### Front-end (Pendente ⏳)
- [ ] Criar cliente HTTP
- [ ] Adaptar serviços de autenticação
- [ ] Adaptar serviços SaaS
- [ ] Adaptar serviços de projetos
- [ ] Adaptar serviços de tarefas
- [ ] Adaptar serviços de clima
- [ ] Adaptar serviços de fotos
- [ ] Adaptar serviços de informativos
- [ ] Atualizar hooks
- [ ] Testar autenticação
- [ ] Testar CRUD completo
- [ ] Deploy

## 🤝 Suporte

Para questões sobre a arquitetura ou implementação, consulte:
- [README da API](../reportfy-api/README.md)
- [Guia de Integração](../reportfy-api/INTEGRATION_GUIDE.md)
- Documentação do Supabase: https://supabase.com/docs
- Documentação do Fastify: https://fastify.dev/

## 📄 Licença

ISC
