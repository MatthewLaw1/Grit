import { ReasoningStep } from '../types';

interface StepBoxProps {
  step: ReasoningStep;
  index: number;
}

export function StepBox({ step, index }: StepBoxProps) {
  return (
    <div className="border-2 border-primary rounded-lg p-6 bg-white shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
          {index + 1}
        </div>
        <h3 className="font-bold text-xl text-primary">{step.goal}</h3>
      </div>

      <div className="space-y-4">
        {/* Raw JSON Display */}
        <div className="font-mono text-sm bg-gray-900 text-white p-4 rounded-md overflow-x-auto">
          <pre>{JSON.stringify(step, null, 2)}</pre>
        </div>

        {/* Formatted Display */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-semibold text-gray-700 mb-2">Reasoning Process:</div>
            <div className="whitespace-pre-wrap">{step.reasoning}</div>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="font-semibold text-primary mb-2">Conclusion:</div>
            <div className="whitespace-pre-wrap">{step.conclusion}</div>
          </div>
        </div>
      </div>
    </div>
  );
}