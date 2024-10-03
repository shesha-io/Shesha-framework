
export type ISheshaErrorTypes = 'info' | 'warning' | 'error';

export interface IModelError {
  propertyName?: string;
  error: string;
  type?: ISheshaErrorTypes;
}

export interface IModelValidation {
  componentId?: string;
  componentName?: string;
  componentType?: string;
  message?: string;
  errors?: IModelError[];
  model?: any;
}

export type GetErrorPlaceholderFunc = (errors: IModelValidation) => React.ReactNode;


export interface ISheshaErrorCause {
  type?: ISheshaErrorTypes;
  errors?: IModelValidation;
}

/**
 * Shesha Error class
 */
export class SheshaError extends Error {

  public cause?: ISheshaErrorCause;

  constructor(message: string, errors?: IModelValidation, type?: ISheshaErrorTypes) {
    super(message);
    this.name = 'SheshaError';
    this.cause = { type, errors: errors || { errors: [{error: message, type}] } };
    if (!this.cause.errors?.message)
      this.cause.errors.message = message;
  }

  /** Check if the Error object is a SheshaError */
  static isSheshaError(error: Error): error is SheshaError {
    return error instanceof SheshaError;
  }

    /** Throw a SheshaError with model property error */
  static throwPropertyError(propertyName: string, error: string = null) {
    throw new SheshaError('', { errors: [{ propertyName, error: error || `Please make sure the '${propertyName}' property is configured properly.`, type: 'warning' }] }, 'warning');
  }
  
  /** Throw a SheshaError with model errors */
  static throwModelErrors(errors: IModelValidation) {
    throw new SheshaError('', errors, 'warning');
  }

  /** Throw a SheshaError with message */
  static throwError(message: string) {
    throw new SheshaError(message, null, 'error');
  }

  /** Add model error, used in model validation function */
  static addModelError(errors: IModelValidation, propertyName: string, error: string) {
    errors.errors.push({ propertyName, error });
  }
}