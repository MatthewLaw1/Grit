'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface Node {
  thought: string;
  value?: number;
  children?: Node[];
}

interface TOTVisualizerProps {
  data: Node | null;
}

const TreeNode: React.FC<{ node: Node; depth: number }> = ({ node, depth }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="relative" style={{ marginLeft: `${depth * 40}px` }}>
      <Card 
        className={`p-4 mb-2 border-l-4 ${
          node.value && node.value > 0.5 ? 'border-l-green-500' : 'border-l-yellow-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">{node.thought}</p>
            {node.value !== undefined && (
              <p className="text-sm text-gray-500">Value: {node.value}</p>
            )}
          </div>
          {node.children && node.children.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>
      </Card>
      
      {isExpanded && node.children && (
        <div className="relative">
          {node.children.map((child, index) => (
            <div key={index} className="relative">
              <div 
                className="absolute border-l-2 border-gray-300"
                style={{
                  left: '-20px',
                  top: '-10px',
                  height: '100%',
                }}
              />
              <TreeNode node={child} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TOTVisualizer: React.FC<TOTVisualizerProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="w-full overflow-x-auto p-4">
      <TreeNode node={data} depth={0} />
    </div>
  );
};