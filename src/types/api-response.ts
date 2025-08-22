export interface APIResponse<T = unknown> {
  count: number;
  next: string | null;
  previous: string | null;
  results?: T[];
}

// "results": [
//   {
//     "slug": "WTGSKb5B",
//     "name": "string"
//   }
// ]
