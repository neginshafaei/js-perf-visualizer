import { useState } from "react";
import Layout from "./components/Layout";
import PerfLab from "./components/Visualizers/PerfLab";
import ConcurrencyLab from "./components/Visualizers/ConcurrencyLab";
import MemoryLab from "./components/Visualizers/MemoryLab";

const MENU = [
  {
    id: "concurrency",
    label: "Concurrency Pool",
    icon: "🚦",
    component: <ConcurrencyLab />,
  },
  { id: "perf", label: "Optimization", icon: "⚡", component: <PerfLab /> },
  { id: "memory", label: "Memory Heap", icon: "🧠", component: <MemoryLab /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("concurrency");

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} menuItems={MENU}>
      {MENU.find((i) => i.id === activeTab)?.component}
    </Layout>
  );
}
