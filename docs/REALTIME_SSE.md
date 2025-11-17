# API Realtime - Server-Sent Events (SSE)

A API agora suporta eventos em tempo real usando Server-Sent Events (SSE) para monitoramento de mudanças no banco de dados e estado de autenticação.

## Endpoints Disponíveis

### 1. Subscribe to Database Changes
**GET** `/api/realtime/subscribe/:table`

Monitora mudanças em tempo real em tabelas específicas.

**Autenticação:** Requerida (Bearer Token)

**Tabelas suportadas:**
- `profiles`
- `clients`
- `projects`
- `project_tasks`
- `project_photos`
- `project_weathers`
- `project_informatives`

**Eventos emitidos:**
- `connected` - Conexão estabelecida
- `database_change` - Mudança no banco de dados (INSERT, UPDATE, DELETE)
- `heartbeat` - Ping a cada 30 segundos
- `error` - Erro na conexão

### 2. Auth State Monitor
**GET** `/api/realtime/auth-state`

Monitora mudanças de estado de autenticação.

**Autenticação:** Não requerida

**Eventos emitidos:**
- `connected` - Conexão estabelecida
- `heartbeat` - Ping a cada 30 segundos

### 3. Health Check
**GET** `/api/realtime/health`

Verifica o status do serviço realtime.

## Exemplos de Uso

### JavaScript/TypeScript (Browser)

```javascript
// Monitorar mudanças em projetos
const token = 'seu-access-token';
const eventSource = new EventSource(
  `http://localhost:3000/api/realtime/subscribe/projects`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Escutar eventos de conexão
eventSource.addEventListener('connected', (event) => {
  const data = JSON.parse(event.data);
  console.log('Conectado:', data.message);
});

// Escutar mudanças no banco de dados
eventSource.addEventListener('database_change', (event) => {
  const data = JSON.parse(event.data);
  console.log('Mudança detectada:', data);
  
  switch(data.type) {
    case 'INSERT':
      console.log('Novo registro:', data.data);
      break;
    case 'UPDATE':
      console.log('Registro atualizado:', data.data);
      console.log('Dados antigos:', data.old);
      break;
    case 'DELETE':
      console.log('Registro deletado:', data.old);
      break;
  }
});

// Escutar heartbeat
eventSource.addEventListener('heartbeat', (event) => {
  const data = JSON.parse(event.data);
  console.log('Heartbeat:', data.timestamp);
});

// Escutar erros
eventSource.addEventListener('error', (event) => {
  console.error('Erro SSE:', event);
});

// Fechar conexão quando necessário
// eventSource.close();
```

### Node.js com eventsource

```javascript
const EventSource = require('eventsource');

const token = 'seu-access-token';
const es = new EventSource(
  'http://localhost:3000/api/realtime/subscribe/project_tasks',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

es.addEventListener('connected', (event) => {
  console.log('Conectado:', JSON.parse(event.data));
});

es.addEventListener('database_change', (event) => {
  const change = JSON.parse(event.data);
  console.log(`[${change.type}] em ${change.table}:`, change.data);
});

es.onerror = (error) => {
  console.error('Erro:', error);
};
```

### React Hook Exemplo

```typescript
import { useEffect, useState } from 'react';

interface DatabaseChange {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  old?: any;
  timestamp: string;
}

export function useRealtimeSubscription(
  table: string, 
  token: string
) {
  const [changes, setChanges] = useState<DatabaseChange[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:3000/api/realtime/subscribe/${table}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    eventSource.addEventListener('database_change', (event) => {
      const change = JSON.parse(event.data);
      setChanges(prev => [...prev, change]);
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [table, token]);

  return { changes, isConnected };
}

// Uso no componente
function MyComponent() {
  const { changes, isConnected } = useRealtimeSubscription(
    'projects', 
    'your-token'
  );

  return (
    <div>
      <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <ul>
        {changes.map((change, idx) => (
          <li key={idx}>
            {change.type} em {change.table} às {change.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Estrutura de Dados dos Eventos

### Evento: connected
```json
{
  "message": "Conectado ao canal projects",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

### Evento: database_change
```json
{
  "type": "INSERT",
  "table": "projects",
  "data": {
    "id": "uuid",
    "name": "Novo Projeto",
    "client_id": "uuid",
    "created_at": "2025-11-17T10:30:00.000Z"
  },
  "old": null,
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

### Evento: heartbeat
```json
{
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

### Evento: error
```json
{
  "message": "Descrição do erro",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

## Requisitos do Supabase

Para que o realtime funcione, é necessário habilitar as publicações no Supabase:

1. Acesse o Supabase Dashboard
2. Vá em Database > Replication
3. Habilite realtime para as tabelas desejadas
4. Certifique-se de que as políticas RLS permitem as operações

## Considerações

- SSE mantém uma conexão HTTP persistente
- O heartbeat previne timeouts de conexão
- A conexão é automaticamente fechada quando o cliente desconecta
- Ideal para updates unidirecionais (servidor → cliente)
- Para comunicação bidirecional, considere WebSockets
- Limite de conexões depende do servidor e do navegador (geralmente 6 por domínio)

## Troubleshooting

**Erro de CORS:**
- Verifique se o origin está permitido em `ALLOWED_ORIGINS`

**Conexão não estabelecida:**
- Verifique se o token está válido
- Confirme que a tabela existe e está habilitada para realtime

**Eventos não são recebidos:**
- Verifique as políticas RLS do Supabase
- Confirme que a replicação está habilitada para a tabela
