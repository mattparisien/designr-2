export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface APIErrorResponse {
  message: string;
}
