# Grit - A Human/AI Collaboration framework.



This project integrates the Tree of Thought LLM framework with a Next.js frontend for interactive reasoning visualization.

## Setup

1. Clone the repository and install dependencies:

```bash
# Install Next.js frontend dependencies
npm install

# Install Python backend dependencies
cd tree-of-thought-llm
pip install -r requirements.txt
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:
```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
TOT_API_URL=http://localhost:8000
```

Create a `.env` file in the tree-of-thought-llm directory:
```
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

1. Start the Python Tree of Thought service:
```bash
cd tree-of-thought-llm
python api.py
```

2. In a new terminal, start the Next.js frontend:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Features

- Toggle between Chain of Thought and Tree of Thought reasoning
- Interactive visualization of reasoning steps
- Support for both OpenAI and Anthropic models
- Tree-based exploration of multiple reasoning paths
- Confidence scoring for each reasoning branch

## Architecture

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: FastAPI service wrapping the Tree of Thought LLM implementation
- APIs: 
  - `/api/openai`: OpenAI integration
  - `/api/anthropic`: Anthropic integration  
  - `/api/tot`: Tree of Thought reasoning service

The Tree of Thought implementation uses beam search to explore multiple reasoning paths and evaluates them to find the most promising solutions.
