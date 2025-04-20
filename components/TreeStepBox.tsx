import { ReasoningStep } from '../types';

interface TreeStepBoxProps {
  step: ReasoningStep;
  index: number;
  depth?: number;
}

export function TreeStepBox({ step, index, depth = 0 }: TreeStepBoxProps) {
  return (
    <div className="relative">
      {/* Connector Line */}
      {depth > 0 && (
        <div className="absolute -top-4 left-5 w-0.5 h-4 bg-primary/30" />
      )}
      
      <div className={`border-2 border-primary rounded-lg p-6 bg-white shadow-lg ${depth > 0 ? 'ml-8' : ''}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
            {index + 1}
          </div>
          <h3 className="font-bold text-xl text-primary">{step.goal}</h3>
        </div>

        <div className="space-y-4">
          {/* Raw JSON Display */}
          <div className="relative">
            <div className="absolute top-2 right-2 text-xs text-gray-500">Step {index + 1} JSON</div>
            <div className="font-mono text-sm bg-gray-900 text-white p-4 pt-8 rounded-md overflow-x-auto">
              <pre>{JSON.stringify(step, null, 2)}</pre>
            </div>
          </div>

          {/* Formatted Display */}
          <div className="space-y-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Reasoning Process:
              </div>
              <div className="whitespace-pre-wrap text-gray-600">{step.reasoning}</div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="font-semibold text-primary mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Conclusion:
              </div>
              <div className="whitespace-pre-wrap text-gray-800">{step.conclusion}</div>
            </div>
          </div>
        </div>

        {/* Render child steps recursively */}
        {step.children && step.children.length > 0 && (
          <div className="mt-8 space-y-8">
            {step.children.map((childStep, childIndex) => (
              <TreeStepBox
                key={childStep.id}
                step={childStep}
                index={childIndex}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}