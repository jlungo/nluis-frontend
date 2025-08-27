export interface APIResponse<T = unknown> {
  count: number;
  next: string | null;
  previous: string | null;
  results?: T[];
}

export interface ApiError {
  response?: {
    data?: {
      detail?: string;
      [key: string]: any;
    };
  };
  message?: string;
}
