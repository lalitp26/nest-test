export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class BusinessRuleValidationException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleValidationException';
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`);
    this.name = 'EntityNotFoundException';
  }
}
