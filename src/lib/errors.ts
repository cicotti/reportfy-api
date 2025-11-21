export class ApiError extends Error {
  type: string;
  
  constructor(type: 'tenant_inactive' | 'validation' | 'query' | 'authentication' | 'critical' = 'critical', message: string) {        
    super(message);
    this.type = type;
    this.name = type;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Não autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}