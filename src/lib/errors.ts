export class ApplicationError extends Error {
  title: string;
  description: string;
  shouldDisplay: boolean;

  constructor(title: string, description: string, shouldDisplay: boolean = true) {
    super(description);
    this.name = 'ApplicationError';
    this.title = title;
    this.description = description;
    this.shouldDisplay = shouldDisplay;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Não autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ApiError extends Error {
  type: string;
  
  constructor(type: 'tenant_inactive' | 'validation' | 'query' | 'authentication' | 'critical' = 'critical', message: string) {        
    super(message);
    this.type = type;
  }
}