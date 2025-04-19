export interface AnthropicResponse {
  response: string;
}

export interface AnthropicError {
  error: string;
}

export interface FormState {
  prompt: string;
  response: string | null;
  error: string | null;
  isLoading: boolean;
}