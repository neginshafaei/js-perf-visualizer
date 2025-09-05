import React, { useState, useCallback } from "react";

export default function MemoryLab() {
  const [nodes, setNodes] = useState([
    {
      id: "ROOT",
      x: 50,
      y: 15,
      type: "root",
      reachable: true,
      status: "stable",
    },
    {
      id: "Window",
      x: 30,
      y: 35,
      parent: "ROOT",
      reachable: true,
      status: "stable",
    },
    {
      id: "Global_Vars",
      x: 70,
      y: 35,
      parent: "ROOT",
      reachable: true,
      status: "stable",
    },
    {
      id: "User_Profile",
      x: 20,
      y: 60,
      parent: "Window",
      reachable: true,
      status: "stable",
    },
    {
      id: "Auth_Token",
      x: 40,
      y: 60,
      parent: "Window",
      reachable: true,
      status: "stable",
    },
    {
      id: "Cache_Data",
      x: 70,
      y: 60,
      parent: "Global_Vars",
      reachable: true,
      status: "stable",
    },
  ]);

  const [isGCRunning, setIsGCRunning] = useState(false);
  const [heapUsage, setHeapUsage] = useState(65);

  const checkReachability = useCallback((currentNodes) => {
    const reachableIds = new Set(["ROOT"]);
    let changed = true;
    while (changed) {
      changed = false;
      currentNodes.forEach((node) => {
        if (
          node.parent &&
          reachableIds.has(node.parent) &&
          !reachableIds.has(node.id)
        ) {
          reachableIds.add(node.id);
          changed = true;
        }
      });
    }
    return currentNodes.map((n) => ({
      ...n,
      reachable: reachableIds.has(n.id),
    }));
  }, []);

  const triggerGC = async () => {
    setIsGCRunning(true);

    setNodes((prev) => prev.map((n) => ({ ...n, status: "marking" })));
    await new Promise((r) => setTimeout(r, 1000));

    setNodes((prev) => {
      const updated = checkReachability(prev);
      return updated.map((n) => ({
        ...n,
        status: n.reachable ? "marked" : "unreachable",
      }));
    });

    await new Promise((r) => setTimeout(r, 1500));
    setNodes((prev) => {
      const remaining = prev.filter((n) => n.reachable);
      setHeapUsage((remaining.length / 10) * 100);
      return remaining.map((n) => ({ ...n, status: "stable" }));
    });

    setIsGCRunning(false);
  };

  const detachNode = (id) => {
    if (id === "ROOT") return;
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, parent: null } : n))
    );
  };

  const allocateObject = () => {
    const parents = nodes.filter((n) => n.reachable).map((n) => n.id);
    const randomParent = parents[Math.floor(Math.random() * parents.length)];
    const newId = `Obj_${Math.random()
      .toString(36)
      .substr(2, 3)
      .toUpperCase()}`;

    setNodes((prev) => [
      ...prev,
      {
        id: newId,
        x: Math.random() * 80 + 10,
        y: Math.random() * 40 + 40,
        parent: randomParent,
        reachable: true,
        status: "stable",
      },
    ]);
    setHeapUsage((prev) => Math.min(100, prev + 10));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            V8 MEMORY ENGINE{" "}
            <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded text-white font-mono uppercase tracking-tighter">
              Heap Inspector
            </span>
          </h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
            Mark-and-Sweep Algorithm Visualization
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={allocateObject}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            ALLOCATE OBJ
          </button>
          <button
            onClick={triggerGC}
            disabled={isGCRunning}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
              isGCRunning
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40"
            }`}
          >
            {isGCRunning ? "GC RUNNING..." : "COLLECT GARBAGE"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest">
              Memory Heap Map
            </h3>
            <div className="relative h-48 w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden p-1 grid grid-cols-4 gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-sm transition-all duration-500 ${
                    i < (heapUsage / 100) * 16
                      ? "bg-indigo-500/40"
                      : "bg-slate-900"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-500 uppercase">Heap Usage</span>
              <span className="text-indigo-400 font-bold">
                {Math.round(heapUsage)}%
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${heapUsage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-slate-900/80 rounded-3xl border border-slate-800 relative min-h-[500px] overflow-hidden shadow-inner">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {nodes.map((node) => {
              if (!node.parent) return null;
              const parent = nodes.find((p) => p.id === node.parent);
              if (!parent) return null;
              return (
                <line
                  key={`${parent.id}-${node.id}`}
                  x1={`${parent.x}%`}
                  y1={`${parent.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke={
                    node.status === "unreachable"
                      ? "#f43f5e"
                      : node.status === "marked"
                      ? "#6366f1"
                      : "#334155"
                  }
                  strokeWidth={node.status === "marking" ? "3" : "1"}
                  strokeDasharray={node.status === "marking" ? "5,5" : "0"}
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => detachNode(node.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 cursor-pointer z-10
                flex flex-col items-center group
              `}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={`
                w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 relative
                ${
                  node.type === "root"
                    ? "bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-500/20"
                    : node.status === "unreachable"
                    ? "bg-rose-500/10 border-rose-500/50 scale-90 opacity-40"
                    : node.status === "marked"
                    ? "bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    : "bg-slate-800 border-slate-700 hover:border-slate-500"
                }
              `}
              >
                <span
                  className={`text-[9px] font-black ${
                    node.type === "root" ? "text-white" : "text-slate-300"
                  }`}
                >
                  {node.type === "root" ? "ROOT" : "OBJ"}
                </span>

                {node.status === "marking" && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 animate-ping opacity-75" />
                )}
              </div>

              <span
                className={`mt-2 text-[8px] font-mono tracking-tighter transition-opacity ${
                  node.status === "unreachable"
                    ? "text-rose-500 font-bold"
                    : "text-slate-500"
                }`}
              >
                {node.id}
              </span>

              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-950 text-white text-[8px] py-1 px-2 rounded border border-slate-800 whitespace-nowrap">
                Click to Detach Reference
              </div>
            </div>
          ))}

          <div className="absolute bottom-6 left-6 flex gap-4 bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-md">
            <LegendItem color="bg-indigo-500" label="Reachable" />
            <LegendItem color="bg-rose-500" label="Candidate for GC" />
            <LegendItem color="bg-slate-700" label="Referenced" />
          </div>
        </div>
      </div>
    </div>
  );
}

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">
      {label}
    </span>
  </div>
);
