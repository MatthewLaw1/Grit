'use client';

import { useState, FormEvent } from 'react';
import type { FormState, ModelProvider, ModelConfig } from './types';
import { MODEL_OPTIONS } from './types';
import { StepBox } from './components/StepBox';

export default function Home() {
  const [formState, setFormState] = useState<FormState>({
    prompt: '',
    response: null,
    error: null,
    isLoading: false,
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`/api/${formState.provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: formState.prompt,
          model: formState.model
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setFormState(prev => ({
        ...prev,
        response: data.response,
        isLoading: false,
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false,
      }));
    }
  };

  const handleProviderChange = (provider: ModelProvider) => {
    const defaultModel = MODEL_OPTIONS[provider][0].value;
    setFormState(prev => ({
      ...prev,
      provider,
      model: defaultModel
    }));
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI Model Integration</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="provider" className="block text-sm font-medium mb-2">
                Provider
              </label>
              <select
                id="provider"
                value={formState.provider}
                onChange={(e) => handleProviderChange(e.target.value as ModelProvider)}
                className="w-full p-2 border rounded-md"
              >
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="model" className="block text-sm font-medium mb-2">
                Model
              </label>
              <select
                id="model"
                value={formState.model}
                onChange={(e) => setFormState(prev => ({ ...prev, model: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                {MODEL_OPTIONS[formState.provider].map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Enter your prompt
            </label>
            <textarea
              id="prompt"
              value={formState.prompt}
              onChange={(e) => setFormState(prev => ({ ...prev, prompt: e.target.value }))}
              className="w-full p-2 border rounded-md min-h-[100px]"
              placeholder="Type your prompt here..."
            />
          </div>
          
          <button
            type="submit"
            disabled={formState.isLoading || !formState.prompt}
            className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {formState.isLoading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {formState.error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {formState.error}
          </div>
        )}

        {formState.response && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-primary">Chain of Thought Process</h2>
              <div className="space-y-6">
                {formState.response.steps.map((step, index) => (
                  <StepBox key={index} step={step} index={index} />
                ))}
              </div>
            </div>
            
            <div className="border-t-2 border-primary/20 pt-8">
              <h2 className="text-2xl font-bold mb-4 text-primary">Final Answer</h2>
              <div className="bg-primary/5 p-6 border-2 border-primary rounded-lg shadow-lg">
                <div className="font-mono text-sm bg-gray-900 text-white p-4 rounded-md overflow-x-auto mb-4">
                  <pre>{JSON.stringify({ finalAnswer: formState.response.finalAnswer }, null, 2)}</pre>
                </div>
                <div className="whitespace-pre-wrap text-lg">{formState.response.finalAnswer}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}