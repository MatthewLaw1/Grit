from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import argparse
from tot.methods.bfs import solve
import json

app = FastAPI()

class TaskInput(BaseModel):
    prompt: str
    temperature: float = 0.7
    n_generate_sample: int = 3
    n_evaluate_sample: int = 3
    n_select_sample: int = 3
    method_generate: str = 'sample'
    method_evaluate: str = 'value'
    method_select: str = 'greedy'
    prompt_sample: str = 'cot'

class TaskResponse(BaseModel):
    steps: List[dict]
    final_output: List[str]

class Task:
    def __init__(self, prompt):
        self.prompt = prompt
        self.steps = 3
        self.stops = ['\n'] * 3
        self.value_cache = {}
        
    def get_input(self, idx):
        return self.prompt
        
    def standard_prompt_wrap(self, x, y):
        return f"{x}\nLet's approach this step-by-step:\n{y}"
        
    def cot_prompt_wrap(self, x, y):
        return f"{x}\nLet's solve this step-by-step:\n{y}"
        
    def value_prompt_wrap(self, x, y):
        return f"""Rate the following reasoning path from 0 to 1, where 1 indicates the most promising path:
Problem: {x}
Reasoning: {y}
Score:"""
        
    def value_outputs_unwrap(self, x, y, value_outputs):
        try:
            return float(value_outputs[0])
        except:
            return 0.0

@app.post("/solve", response_model=TaskResponse)
async def solve_task(task_input: TaskInput):
    try:
        args = argparse.Namespace(
            backend='gpt-4',
            temperature=task_input.temperature,
            n_generate_sample=task_input.n_generate_sample,
            n_evaluate_sample=task_input.n_evaluate_sample,
            n_select_sample=task_input.n_select_sample,
            method_generate=task_input.method_generate,
            method_evaluate=task_input.method_evaluate,
            method_select=task_input.method_select,
            prompt_sample=task_input.prompt_sample
        )
        
        task = Task(task_input.prompt)
        final_outputs, info = solve(args, task, 0, to_print=False)
        
        return {
            "steps": info["steps"],
            "final_output": final_outputs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)