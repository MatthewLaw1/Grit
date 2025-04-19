'use client';

import { useState, FormEvent } from 'react';
import type { FormState } from './types';

export default function Home() {
  const [formState, setFormState] = useState<FormState>({
    prompt: '',
    response: null,
    error: null,
    isLoading: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: formState.prompt }),
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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Anthropic API Integration</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Response:</h2>
            <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
              {formState.response}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}