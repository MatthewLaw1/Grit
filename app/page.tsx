'use client';

import { useState, FormEvent } from 'react';
import type { FormState, ModelProvider, ModelConfig, ReasoningStep } from './types';
import { MODEL_OPTIONS } from './types';
import { StepBox } from './components/StepBox';
import { TreeStepBox } from './components/TreeStepBox';

export default function Home() {
  const [formState, setFormState] = useState<FormState>({
    prompt: '',
    response: null,
    error: null,
    isLoading: false,
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    thoughtMode: 'chain'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const endpoint = formState.thoughtMode === 'tree' ? '/api/tot' : `/api/${formState.provider}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: formState.prompt,
          model: formState.model,
          thoughtMode: formState.thoughtMode
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
          <div className="flex gap-4 mb-4 items-end">
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

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Reasoning Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, thoughtMode: 'chain' }))}
                  className={`flex-1 p-2 rounded-md border ${
                    formState.thoughtMode === 'chain'
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Chain of Thought
                </button>
                <button
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, thoughtMode: 'tree' }))}
                  className={`flex-1 p-2 rounded-md border ${
                    formState.thoughtMode === 'tree'
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Tree of Thought
                </button>
              </div>
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
          <div className="mt-8 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  {formState.thoughtMode === 'chain' ? 'Chain' : 'Tree'} of Thought Process
                </h2>
                <div className="text-sm px-2 py-1 bg-primary/10 rounded-full text-primary">
                  {formState.response.steps.length} Steps
                </div>
              </div>
              <div className="space-y-8">
                {formState.thoughtMode === 'chain' ? (
                  formState.response.steps.map((step, index) => (
                    <StepBox key={index} step={step} index={index} />
                  ))
                ) : (
                  // For tree mode, only render top-level steps (those without parents)
                  formState.response.steps
                    .filter((step: ReasoningStep) => !step.parentId)
                    .map((step, index) => (
                      <TreeStepBox key={step.id} step={step} index={index} />
                    ))
                )}
              </div>
            </div>
            
            <div className="relative">
              {/* Connector from last step to final answer */}
              <div className="absolute -top-8 left-5 w-0.5 h-8 bg-primary/30" />
              
              <div className="border-t-2 border-primary/20 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-primary">Final Answer</h2>
                  <div className="text-sm px-2 py-1 bg-primary/10 rounded-full text-primary">
                    Result
                  </div>
                </div>
                <div className="bg-primary/5 p-6 border-2 border-primary rounded-lg shadow-lg">
                  <div className="relative">
                    <div className="absolute top-2 right-2 text-xs text-gray-500">Final Answer JSON</div>
                    <div className="font-mono text-sm bg-gray-900 text-white p-4 pt-8 rounded-md overflow-x-auto mb-4">
                      <pre>{JSON.stringify({ finalAnswer: formState.response.finalAnswer }, null, 2)}</pre>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-white rounded-lg border border-primary/20">
                    <div className="whitespace-pre-wrap text-lg text-gray-800">{formState.response.finalAnswer}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}