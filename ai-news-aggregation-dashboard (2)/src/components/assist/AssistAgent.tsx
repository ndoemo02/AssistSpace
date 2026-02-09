import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
    Play,
    Square,
    Terminal,
    CheckCircle2,
    Circle,
    Loader2,
    AlertCircle,
    Cpu,
    Eraser
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { generateAIResponse } from '@/lib/gemini';

export function AssistAgent() {
    const {
        assist,
        setAgentGoal,
        setAgentStatus,
        addAgentTask,
        updateAgentTask,
        addAgentLog,
        clearAgent
    } = useStore();

    const { agent } = assist || {
        agent: {
            goal: '',
            status: 'idle',
            tasks: [],
            logs: []
        }
    };

    // Safety check just in case persist didn't migrate correctly
    const safeAgent = agent || {
        goal: '',
        status: 'idle',
        tasks: [],
        logs: []
    };

    const [goalInput, setGoalInput] = useState(safeAgent.goal || '');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [safeAgent.logs]);

    const handleStart = async () => {
        if (!goalInput.trim()) return;

        // Reset if previously completed
        if (safeAgent.status === 'completed' || safeAgent.status === 'failed') {
            clearAgent();
            setAgentGoal(goalInput);
        } else {
            setAgentGoal(goalInput);
        }

        setAgentStatus('planning');
        addAgentLog(`Starting agent with goal: "${goalInput}"`);

        try {
            // 1. Generate Plan (Client-side)
            const planPrompt = `
            Jesteś autonomicznym agentem AI. Twój cel to: "${goalInput}".
            Rozbij ten cel na 3-5 konkretnych, logicznych kroków (zadań) niezbędnych do jego realizacji.
            Skup się na działaniu (np. "Wyszukaj...", "Przeanalizuj...", "Napisz...").
            
            Zwróć TYLKO listę kroków w formacie JSON: ["krok 1", "krok 2", ...].
            Nie dodawaj żadnego formatowania markdown (bez \`\`\`json).
            `;

            const planResponse = await generateAIResponse(planPrompt);
            const cleanPlan = planResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const tasks: string[] = JSON.parse(cleanPlan);

            if (!Array.isArray(tasks) || tasks.length === 0) throw new Error("Invalid plan generated");

            tasks.forEach(task => addAgentTask(task));
            setAgentStatus('running');
            addAgentLog(`Plan generated: ${tasks.length} tasks.`);

        } catch (e: any) {
            setAgentStatus('failed');
            addAgentLog(`Planning error: ${e.message}`);
        }
    };

    // Execution Loop (Client-side Effect)
    useEffect(() => {
        let isCancelled = false;

        const executeNextTask = async () => {
            if (safeAgent.status !== 'running') return;

            const pendingTask = safeAgent.tasks.find(t => t.status === 'pending');

            if (!pendingTask) {
                if (safeAgent.tasks.length > 0 && safeAgent.tasks.every(t => t.status === 'completed')) {
                    setAgentStatus('completed');
                    addAgentLog("All tasks completed successfully.");
                }
                return;
            }

            // Execute Task
            updateAgentTask(pendingTask.id, 'running');
            addAgentLog(`Executing: ${pendingTask.description}`);

            try {
                // Gather Context
                const context = safeAgent.tasks
                    .filter(t => t.status === 'completed' && t.result)
                    .map(t => `- Task: ${t.description}\n  Result: ${t.result}`)
                    .join('\n');

                const executionPrompt = `
                Main Goal: ${safeAgent.goal}
                Current Task: ${pendingTask.description}
                
                Previous Context:
                ${context}
                
                Jako Agent AI, wykonaj to zadanie. 
                Jeśli zadanie wymaga wiedzy ze świata (której nie masz), symuluj realistyczny wynik lub napisz ogólne wnioski.
                Odpisz w języku polskim. Bądź konkretny i profesjonalny. Max 3 zdania.
                `;

                // Simulated delay for "thinking"
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (isCancelled) return;

                const result = await generateAIResponse(executionPrompt);

                updateAgentTask(pendingTask.id, 'completed', result);
                addAgentLog(`Completed: ${pendingTask.description}`);

            } catch (e: any) {
                updateAgentTask(pendingTask.id, 'failed', e.message);
                addAgentLog(`Task failed: ${e.message}`);
                setAgentStatus('failed'); // Stop on error? or continue? let's stop for now.
            }
        };

        if (safeAgent.status === 'running') {
            executeNextTask();
        }

        return () => { isCancelled = true; };
    }, [safeAgent.status, safeAgent.tasks, safeAgent.goal]); // Re-run when tasks update to pick next one

    const handleStop = async () => {
        setAgentStatus('idle');
        addAgentLog('Agent stopped by user.');
    };

    const handleClear = () => {
        clearAgent();
        setGoalInput('');
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            {/* Header & Input */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Cpu className="h-8 w-8 text-violet-600" />
                        Autonomous Agent
                    </h1>
                    <p className="text-slate-500">
                        Zdefiniuj cel, a agent AI autonomicznie zaplanuje i wykona zadania.
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={goalInput}
                            onChange={(e) => setGoalInput(e.target.value)}
                            placeholder="Np. Zrób research konkurencji dla aplikacji do medytacji i zapisz wnioski..."
                            className="w-full rounded-xl border-slate-200 pl-4 pr-12 py-3 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                            disabled={safeAgent.status === 'running' || safeAgent.status === 'planning'}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        />
                    </div>

                    {(safeAgent.status === 'running' || safeAgent.status === 'planning') ? (
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 rounded-xl bg-red-50 px-6 py-3 font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        >
                            <Square className="h-5 w-5 fill-current" />
                            Stop
                        </button>
                    ) : (
                        <button
                            onClick={handleStart}
                            disabled={!goalInput.trim()}
                            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-lg shadow-violet-200"
                        >
                            <Play className="h-5 w-5 fill-current" />
                            Start
                        </button>
                    )}

                    <button
                        onClick={handleClear}
                        className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Wyczyść"
                    >
                        <Eraser className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* Tasks Column */}
                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Tasks
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-600 rounded-full">
                            {safeAgent.tasks.filter(t => t.status === 'completed').length} / {safeAgent.tasks.filter(t => t).length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {(!safeAgent.tasks || safeAgent.tasks.length === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                                <CheckCircle2 className="h-12 w-12 opacity-20" />
                                <p>Brak zadań. Uruchom agenta, aby rozpocząć planowanie.</p>
                            </div>
                        )}

                        {safeAgent.tasks?.map((task) => (
                            <div
                                key={task.id}
                                className={cn(
                                    "group relative rounded-xl border p-3 transition-all",
                                    task.status === 'running' ? "border-violet-200 bg-violet-50/50" :
                                        task.status === 'completed' ? "border-emerald-100 bg-emerald-50/30" :
                                            task.status === 'failed' ? "border-red-100 bg-red-50/30" :
                                                "border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-0.5">
                                        {task.status === 'running' ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                                        ) : task.status === 'completed' ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        ) : task.status === 'failed' ? (
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            task.status === 'completed' ? "text-slate-600 line-through decoration-slate-300" : "text-slate-900"
                                        )}>
                                            {task.description}
                                        </p>
                                        {task.result && (
                                            <div className="mt-2 text-xs bg-white/50 p-2 rounded border border-slate-100 text-slate-600 font-mono">
                                                {task.result}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Terminal / Logs Column */}
                <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden text-slate-400 font-mono text-xs">
                    <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        <span className="font-semibold text-slate-300">Agent Logs</span>
                        <div className="flex gap-1.5 ml-auto">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700"
                    >
                        {(!safeAgent.logs || safeAgent.logs.length === 0) && (
                            <span className="text-slate-600 italic">Ready for input...</span>
                        )}
                        {safeAgent.logs?.map((log, i) => (
                            <div key={i} className="break-words">
                                <span className="text-emerald-500 mr-2">➜</span>
                                {log}
                            </div>
                        ))}
                        {safeAgent.status === 'running' && (
                            <div className="animate-pulse text-violet-400">_</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
