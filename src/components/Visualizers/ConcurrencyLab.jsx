import React, { useState, useEffect } from 'react';

export default function ConcurrencyLab() {
  const [concurrency, setConcurrency] = useState(3);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);

  const enqueueTasks = () => {
    const newEntries = Array.from({ length: 5 }, () => ({
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      status: 'pending',
      progress: 0,
      duration: Math.random() * 4000 + 2000, // 2-6 seconds
    }));
    setTasks(prev => [...prev, ...newEntries]);
    addLog(`Enqueued 5 new tasks to the buffer.`);
  };

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(currentTasks => {
        const running = currentTasks.filter(t => t.status === 'running');
        const pending = currentTasks.filter(t => t.status === 'pending');

        let updatedTasks = [...currentTasks];

        updatedTasks = updatedTasks.map(task => {
          if (task.status === 'running') {
            const nextProgress = task.progress + (100 / (task.duration / 100));
            if (nextProgress >= 100) {
              return { ...task, status: 'completed', progress: 100 };
            }
            return { ...task, progress: nextProgress };
          }
          return task;
        });

        const availableSlots = concurrency - running.length;
        if (availableSlots > 0 && pending.length > 0) {
          const toStart = pending.slice(0, availableSlots);
          toStart.forEach(t => addLog(`Slot secured for Task_${t.id}`));
          
          updatedTasks = updatedTasks.map(task => 
            toStart.find(s => s.id === task.id) 
              ? { ...task, status: 'running' } 
              : task
          );
        }

        return updatedTasks;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [concurrency]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left w-full">
            <h2 className="text-2xl font-black text-white tracking-tight">PROMISE POOL</h2>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">Concurrency Resource Management</p>
          </div>
          
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="flex-1 md:w-48">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Max Parallelism</span>
                <span className="text-cyan-400 font-mono text-xs">{concurrency} Slots</span>
              </div>
              <input 
                type="range" min="1" max="6" value={concurrency} 
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <button 
              onClick={enqueueTasks}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-cyan-900/40 whitespace-nowrap"
            >
              GENERATE TASKS
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-5 overflow-hidden flex flex-col h-125">
          <Header title="Pending Buffer" count={tasks.filter(t => t.status === 'pending').length} color="text-slate-500" />
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
            {tasks.filter(t => t.status === 'pending').map(t => (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex justify-between items-center animate-in slide-in-from-left-4">
                <span className="text-xs font-mono font-bold text-slate-400">ID: {t.id}</span>
                <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-400 uppercase">Waiting</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-3xl border-2 border-cyan-500/20 p-5 flex flex-col h-125 shadow-[0_0_40px_rgba(6,182,212,0.05)]">
          <Header title="Active Workers" count={`${tasks.filter(t => t.status === 'running').length}/${concurrency}`} color="text-cyan-400" />
          <div className="flex-1 space-y-4 pr-2 overflow-y-auto">
            {Array.from({ length: concurrency }).map((_, idx) => {
              const activeTask = tasks.filter(t => t.status === 'running')[idx];
              return (
                <div key={idx} className={`h-20 rounded-2xl border-2 transition-all duration-500 flex flex-col justify-center px-4 ${activeTask ? 'bg-cyan-500/5 border-cyan-500/40' : 'bg-transparent border-slate-800 border-dashed opacity-40'}`}>
                  {activeTask ? (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400">EXECUTING: {activeTask.id}</span>
                        <span className="text-[10px] font-mono text-cyan-600">{Math.round(activeTask.progress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 transition-all duration-100 ease-linear shadow-[0_0_8px_#06b6d4]" 
                          style={{ width: `${activeTask.progress}%` }} 
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-700 font-bold uppercase text-center tracking-widest">Idle Slot {idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-5 flex flex-col h-125">
          <Header title="Completed" count={tasks.filter(t => t.status === 'completed').length} color="text-emerald-500" />
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {tasks.filter(t => t.status === 'completed').reverse().map(t => (
              <div key={t.id} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center opacity-60">
                <span className="text-xs font-mono text-emerald-400">TASK_{t.id}</span>
                <span className="text-[9px] text-emerald-600 font-bold italic font-mono">SUCCESS</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-black rounded-2xl p-4 border border-slate-800 font-mono text-[10px] text-slate-500 h-32 overflow-hidden shadow-inner">
        <div className="flex justify-between items-center mb-2 border-b border-slate-900 pb-2 uppercase tracking-tighter font-bold">
          <span>System Engine Logs</span>
          <span className="text-cyan-900">Output_STDOUT</span>
        </div>
        {logs.map((log, i) => <div key={i} className="animate-in fade-in slide-in-from-bottom-1">{log}</div>)}
      </div>
    </div>
  );
}

const Header = ({ title, count, color }) => (
  <div className="flex justify-between items-center mb-6 px-2">
    <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${color}`}>{title}</h3>
    <span className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded-md text-slate-400 font-bold">N: {count}</span>
  </div>
);