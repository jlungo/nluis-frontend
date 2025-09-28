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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  };
  message?: string;
}
