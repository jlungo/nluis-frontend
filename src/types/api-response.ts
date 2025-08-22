export interface APIResponse<T = unknown> {
  count: number;
  next: string | null;
  previous: string | null;
  results?: T[];
}
