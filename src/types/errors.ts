// src/types/errors.ts
export type ApiError = {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
};

export type ValidationErrorType = 'boundary' | 'size' | 'overlap' | 'landUse';

export type SubdivisionError = {
  type: ValidationErrorType;
  message: string;
  field?: string;
  details?: unknown;
};