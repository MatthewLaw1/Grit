'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TOTVisualizer } from '../../components/TOTVisualizer';

interface TOTResponse {
  thought: string;
  value?: number;
  children?: TOTResponse[];
}

export default function TOTPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TOTResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Please enter a problem to solve');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process the request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card className="w-full max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-4">Tree of Thoughts Visualization</h1>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your problem (e.g., '24 game: 4 8 7 3')"
              className="flex-1"
            />
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? 'Processing...' : 'Generate'}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Thought Process Tree</h2>
              <TOTVisualizer data={result} />
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}