export type ModelProvider = 'anthropic' | 'openai';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
}

export const MODEL_OPTIONS = {
  anthropic: [
    { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' }
  ],
  openai: [
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
    { label: 'GPT-4', value: 'gpt-4' }
  ]
};

export interface ReasoningStep {
  goal: string;
  reasoning: string;
  conclusion: string;
}

export interface ChainOfThoughtResponse {
  steps: ReasoningStep[];
  finalAnswer: string;
}

export interface AnthropicResponse {
  response: ChainOfThoughtResponse;
}

export interface AnthropicError {
  error: string;
}

export interface FormState {
  prompt: string;
  response: ChainOfThoughtResponse | null;
  error: string | null;
  isLoading: boolean;
  provider: ModelProvider;
  model: string;
}