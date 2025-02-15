import React, { useState, useMemo } from 'react';
import { useDebounce, useThrottle } from '../../hooks/usePerf';

const Track = ({ label, color, dots, count, efficiency, description }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex justify-between items-end mb-2 px-1">
      <div>
        <h3 className={`text-xs font-black uppercase tracking-wider text-${color}-400`}>{label}</h3>
        <p className="text-[10px] text-slate-500 font-medium">{description}</p>
      </div>
      <div className="text-right">
        <span className="block text-[10px] font-mono text-slate-400">Captured: {count}</span>
        {efficiency !== undefined && (
          <span className={`text-[9px] font-bold ${efficiency > 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
            Efficiency: {efficiency}%
          </span>
        )}
      </div>
    </div>
    <div className="relative h-14 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner overflow-hidden">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={`absolute h-full w-1 bg-${color}-500 shadow-[0_0_12px] shadow-${color}-500/60 animate-[move-left_6s_linear_forwards]`}
          style={{ right: 0 }}
        />
      ))}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10" />
    </div>
  </div>
);

export default function PerfLab() {
  const [delay, setDelay] = useState(600);
  const [data, setData] = useState({ raw: [], deb: [], thr: [] });
  const [counts, setCounts] = useState({ raw: 0, deb: 0, thr: 0 });
  const [inputValue, setInputValue] = useState("");

  const addDot = (type) => {
    setData((p) => ({
      ...p,
      [type]: [{ id: Math.random() + Date.now() }, ...p[type]].slice(0, 40),
    }));
    setCounts((p) => ({ ...p, [type]: p[type] + 1 }));
  };

  const debouncedTrigger = useDebounce(() => addDot("deb"), delay);
  const throttledTrigger = useThrottle(() => addDot("thr"), delay);

  const handleInteraction = () => {
    addDot("raw");
    debouncedTrigger();
    throttledTrigger();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    handleInteraction();
  };

  // Calculate optimization metrics
  const stats = useMemo(() => ({
    debSaved: counts.raw > 0 ? Math.round(((counts.raw - counts.deb) / counts.raw) * 100) : 0,
    thrSaved: counts.raw > 0 ? Math.round(((counts.raw - counts.thr) / counts.raw) * 100) : 0
  }), [counts]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Configuration & Input Header */}
      <div className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tighter italic underline decoration-cyan-500 underline-offset-8">EVENT STRATEGY</h2>
              <span className="text-[10px] font-mono bg-slate-950 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">WINDOW: {delay}ms</span>
            </div>
            
            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Type to simulate Search API..."
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-cyan-500 transition-all font-mono"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <button
                  onMouseMove={handleInteraction}
                  className="flex-1 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-200 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-600/50 active:scale-95"
                >
                  Hover Area (Noise Generator)
                </button>
                <button 
                  onClick={() => {
                    setCounts({ raw: 0, deb: 0, thr: 0 });
                    setData({ raw: [], deb: [], thr: [] });
                    setInputValue("");
                  }}
                  className="p-4 bg-slate-800 rounded-2xl border border-slate-700 hover:bg-rose-500/10 hover:border-rose-500/50 transition-colors"
                >
                  🗘
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
              "When a user types 10 characters in 1 second, a raw input triggers 10 API calls. Optimization patterns ensure we only trigger what's necessary, saving CPU and Network bandwidth."
            </p>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block">Timing Interval (MS)</label>
              <input
                type="range" min="200" max="2000" step="100" value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualization */}
      <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
        <Track
          label="Raw Events (Noise)"
          description="Every single interaction or keystroke is captured. Heavy & expensive."
          color="rose"
          dots={data.raw}
          count={counts.raw}
        />
        
        <div className="my-8 border-t border-slate-800/50 border-dashed" />

        <Track
          label="Debounced (Burst Control)"
          description="Wait for silence. Perfect for Search Bars and Auto-save."
          color="cyan"
          dots={data.deb}
          count={counts.deb}
          efficiency={stats.debSaved}
        />

        <div className="my-8 border-t border-slate-800/50 border-dashed" />

        <Track
          label="Throttled (Rate Limiting)"
          description="Fixed execution frequency. Ideal for Scrolling or Resizing."
          color="amber"
          dots={data.thr}
          count={counts.thr}
          efficiency={stats.thrSaved}
        />
      </div>

      {/* Technical Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-500 font-bold text-xl">
             {stats.debSaved}%
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-400">Payload Reduction</h4>
            <p className="text-[10px] text-slate-500">Percentage of redundant network requests prevented using Debounce strategy.</p>
          </div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500 font-bold text-xl">
             {counts.thr}
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-400">Steady Pulse</h4>
            <p className="text-[10px] text-slate-500">Fixed rate executions allowed during continuous high-frequency user interaction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}