import time
import threading
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from duckduckgo_search import DDGS

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class AutonomousAgent:
    def __init__(self):
        self.status = "idle"
        self.goal = ""
        self.tasks = []
        self.logs = []
        self.thread = None
        self.stop_event = threading.Event()
        self.search_tool = DDGS()

    def start(self, goal):
        if self.thread and self.thread.is_alive():
            self.stop()
        
        self.goal = goal
        self.status = "planning"
        self.tasks = []
        self.logs = []
        self.stop_event.clear()
        
        self.log(f"Received goal: {goal}")
        self.thread = threading.Thread(target=self._run_loop)
        self.thread.start()
        return {"status": "started"}

    def stop(self):
        self.stop_event.set()
        if self.thread:
            self.thread.join(timeout=2)
        self.status = "idle"
        self.log("Agent stopped.")

    def get_state(self):
        return {
            "status": self.status,
            "goal": self.goal,
            "tasks": self.tasks,
            "logs": self.logs[-50:] # Limit logs to last 50
        }

    def log(self, message):
        print(f"[Agent] {message}")
        self.logs.append(message)

    def _run_loop(self):
        try:
            # 1. Planning phase
            self.log("Analyzing goal and generating tasks...")
            plan = self._generate_plan(self.goal)
            
            if not plan:
                self.status = "failed"
                self.log("Failed to generate plan.")
                return

            self.tasks = [{"description": task, "status": "pending", "result": None} for task in plan]
            self.log(f"Plan generated: {len(self.tasks)} tasks.")
            self.status = "running"
            
            # 2. Execution Loop
            context = ""
            for i, task in enumerate(self.tasks):
                if self.stop_event.is_set():
                    break
                
                self.tasks[i]["status"] = "running"
                self.log(f"Executing task: {task['description']}")
                
                # Determine if search is needed
                is_search_needed, query = self._check_search_need(task['description'])
                
                if is_search_needed:
                    self.log(f"Searching web for: {query}")
                    search_results = self._perform_search(query)
                    self.log(f"Found {len(search_results)} results.")
                    task_context = f"Search Results for '{query}':\n{search_results}"
                else:
                    task_context = "Task executed based on internal knowledge."

                # Execute task using LLM with context
                result = self._execute_task_with_llm(task['description'], context + "\n" + task_context)
                
                self.tasks[i]["result"] = result
                self.tasks[i]["status"] = "completed"
                self.log(f"Task completed.")
                
                # Update context for next tasks
                context += f"\nFinished Task: {task['description']}\nResult: {result}\n"
                time.sleep(1)

            self.status = "completed"
            self.log("All tasks completed successfully.")

        except Exception as e:
            self.status = "failed"
            self.log(f"Error in agent loop: {e}")

    def _generate_plan(self, goal):
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            Jesteś autonomicznym agentem AI. Twój cel to: "{goal}".
            Rozbij ten cel na 3-5 konkretnych, logicznych kroków (zadań) niezbędnych do jego realizacji.
            Skup się na działaniu (np. "Wyszukaj...", "Przeanalizuj...", "Napisz...").
            
            Zwróć TYLKO listę kroków w formacie JSON: ["krok 1", "krok 2", ...].
            Nie dodawaj żadnego formatowania markdown (```json).
            """
            response = model.generate_content(prompt)
            text = response.text.strip()
            # Clean up markdown if model adds it anyway
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                if text.endswith("```"):
                    text = text[:-3]
            return json.loads(text)
        except Exception as e:
            self.log(f"Planning fallback due to error: {e}")
            return ["Zanalizować cel", "Wykonać research", "Podsumować wyniki"]

    def _check_search_need(self, task_description):
        """Returns (bool, query_string)"""
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            Task: "{task_description}"
            Does this task require searching the live internet for up-to-date information, news, or specific data not in general knowledge?
            Answer JSON directly: {{"search_needed": true, "query": "search query"}} or {{"search_needed": false}}
            Ensure valid JSON output. No markdown.
            """
            response = model.generate_content(prompt)
            data = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            return data.get('search_needed', False), data.get('query', '')
        except:
            return False, ""

    def _perform_search(self, query):
        try:
            results = list(self.search_tool.text(query, max_results=3))
            return json.dumps(results, ensure_ascii=False)
        except Exception as e:
            return f"Search failed: {e}"

    def _execute_task_with_llm(self, task, context):
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Gather context from previous tasks
            previous_results = "\n".join([
                f"- Task: {t['description']}\n  Result: {t['result']}" 
                for t in self.tasks if t['result']
            ])
            
            full_context = f"Main Goal: {self.goal}\nCurrent Task: {task}\nContext:\n{context}\nPrevious Results:\n{previous_results}"
            
            prompt = f"""
            {full_context}
            
            Jako Agent AI, wykonaj to zadanie. 
            Korzystaj z dostarczonych wyników wyszukiwania (Search Results) jeśli są dostępne.
            Odpisz w języku polskim. Bądź konkretny i profesjonalny. Max 3 zdania.
            """
            response = model.generate_content(prompt)
            return response.text.strip()
        except:
            return "Zadanie wykonane (symulacja/błąd LLM)."

# Global instance
agent_instance = AutonomousAgent()
