# Guia de Integração Front-end com a API

Este documento explica como adaptar o front-end para consumir a API Reportfy ao invés de acessar o Supabase diretamente.

## 🔄 Mudanças Necessárias

### 1. Configuração da API

Adicione a URL da API nas variáveis de ambiente do front-end:

**`.env`** ou **`.env.local`**:
```env
VITE_API_URL=http://localhost:3000/api
# Para produção: https://sua-api.vercel.app/api
```

### 2. Criar Cliente HTTP

Crie um arquivo para configurar o cliente HTTP (Axios ou Fetch):

**`src/lib/api.ts`**:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  private getAuthToken(): string | null {
    // Pega o token do localStorage ou do contexto de autenticação
    const session = localStorage.getItem('supabase.auth.token');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.access_token;
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Erro na requisição');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, file: File, data?: Record<string, any>): Promise<T> {
    const token = this.getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro no upload');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### 3. Adaptar Serviços

Modifique os serviços para usar a API ao invés do Supabase diretamente:

#### Exemplo: `src/services/saas/auth.ts`

**ANTES:**
```typescript
import { supabase, supabaseSaas } from "@/integrations/supabase/client";

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  // ... resto do código
};
```

**DEPOIS:**
```typescript
import { apiClient } from "@/lib/api";

export const login = async (email: string, password: string) => {
  const result = await apiClient.post<{ user: User; session: any }>('/auth/login', {
    email,
    password
  });
  
  // Salva o token no localStorage
  if (result.session) {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token
    }));
  }
  
  return result;
};
```

#### Exemplo: `src/services/specific/projects.ts`

**ANTES:**
```typescript
export async function fetchProjects(clientId?: string): Promise<ProjectWithClient[]> {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("is_soft_deleted", false);
  
  if (clientId) query = query.eq("client_id", clientId);
  
  const { data, error } = await query;
  // ... resto
}
```

**DEPOIS:**
```typescript
export async function fetchProjects(clientId?: string): Promise<ProjectWithClient[]> {
  const queryString = clientId ? `?client_id=${clientId}` : '';
  return apiClient.get<ProjectWithClient[]>(`/projects${queryString}`);
}
```

### 4. Mapeamento de Endpoints

| Serviço Original | Endpoint da API | Método |
|-----------------|----------------|--------|
| `auth.login()` | `/auth/login` | POST |
| `auth.signup()` | `/auth/signup` | POST |
| `auth.getCurrentUser()` | `/auth/me` | GET |
| `auth.resetPassword()` | `/auth/reset-password` | POST |
| `companies.fetchCompanies()` | `/companies` | GET |
| `companies.createCompany()` | `/companies` | POST |
| `companies.updateCompany(id)` | `/companies/:id` | PUT |
| `companies.deleteCompany(id)` | `/companies/:id` | DELETE |
| `clients.fetchClients()` | `/clients` | GET |
| `clients.createClient()` | `/clients` | POST |
| `clients.updateClient(id)` | `/clients/:id` | PUT |
| `clients.softDeleteClient(id)` | `/clients/:id` | DELETE |
| `projects.fetchProjects()` | `/projects` | GET |
| `projects.fetchProject(id)` | `/projects/:id` | GET |
| `projects.createProject()` | `/projects` | POST |
| `projects.updateProject(id)` | `/projects/:id` | PUT |
| `projects.softDeleteProject(id)` | `/projects/:id` | DELETE |
| `weather.getProjectWeather(id)` | `/weather/:projectId` | GET |
| `weather.syncProjectWeatherFromAPI()` | `/weather/:projectId/sync` | POST |
| `photos.getProjectPhotos(id)` | `/photos/:projectId` | GET |
| `photos.uploadProjectPhoto()` | `/photos/:projectId` | POST (multipart) |
| `photos.deleteProjectPhoto(id)` | `/photos/:id` | DELETE |

### 5. Adaptar Hooks

Os hooks precisam ser atualizados para usar os novos serviços:

**Exemplo: Hook de Projetos**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as projectsService from '@/services/specific/projects';

export function useProjects(clientId?: string) {
  return useQuery({
    queryKey: ['projects', clientId],
    queryFn: () => projectsService.fetchProjects(clientId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

### 6. Tratamento de Erros

A API retorna erros no formato:
```json
{
  "error": "Título do erro",
  "message": "Descrição detalhada"
}
```

Adapte o tratamento de erros no front-end:

```typescript
try {
  await apiClient.post('/projects', projectData);
} catch (error) {
  if (error instanceof Error) {
    toast.error(error.message);
  }
}
```

### 7. Autenticação com Supabase Auth

O Supabase Auth ainda pode ser usado no front-end para gerenciar sessões, mas as chamadas à base de dados devem ir via API:

```typescript
// Login continua usando Supabase para gerar o token
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Mas os dados do usuário vêm da API
const user = await apiClient.get('/auth/me');
```

OU você pode mover completamente a autenticação para a API:

```typescript
// Login via API (recomendado)
const result = await apiClient.post('/auth/login', { email, password });

// Salva o token
localStorage.setItem('auth_token', result.session.access_token);
```

## 🚀 Deploy

### Front-end (Vercel)
1. Configure a variável `VITE_API_URL` no painel da Vercel
2. Aponte para a URL da sua API em produção
3. Deploy normal do front-end

### API (Vercel)
1. Configure as variáveis de ambiente (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
2. Execute `vercel --prod`
3. Copie a URL da API e configure no front-end

## 📝 Checklist de Migração

- [ ] Criar arquivo `src/lib/api.ts` com cliente HTTP
- [ ] Atualizar variáveis de ambiente (`.env`)
- [ ] Adaptar `src/services/saas/auth.ts`
- [ ] Adaptar `src/services/saas/users.ts`
- [ ] Adaptar `src/services/saas/companies.ts`
- [ ] Adaptar `src/services/saas/clients.ts`
- [ ] Adaptar `src/services/specific/projects.ts`
- [ ] Adaptar `src/services/specific/tasks.ts` (se necessário)
- [ ] Adaptar `src/services/specific/weather.ts`
- [ ] Adaptar `src/services/specific/photos.ts`
- [ ] Atualizar hooks que usam os serviços
- [ ] Testar autenticação
- [ ] Testar todas as funcionalidades CRUD
- [ ] Deploy da API na Vercel
- [ ] Configurar variável `VITE_API_URL` no front-end
- [ ] Deploy do front-end na Vercel

## 🔍 Testando Localmente

1. **Inicie a API:**
```bash
cd reportfy-api
npm run dev
```

2. **Inicie o Front-end:**
```bash
cd saas-boilerplate
npm run dev
```

3. **Certifique-se que `VITE_API_URL=http://localhost:3000/api` no `.env` do front-end**

4. **Teste as funcionalidades:**
   - Login
   - Criação de empresa/cliente
   - CRUD de projetos
   - Upload de fotos
   - Sincronização de clima
