const SidebarItem = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active
        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
        : "text-slate-400 hover:bg-slate-800/50"
    }`}
  >
    {/* <span className="text-lg">{icon}</span> */}
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  menuItems,
}) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      <aside className="w-64 border-r border-slate-800/50 bg-[#070b14] p-6 hidden md:block">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-black font-black italic">
            JS
          </div>
          <span className="font-black tracking-tighter text-lg text-white">
            VISUAL LAB
          </span>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              active={activeTab === item.id}
              label={item.label}
            //   icon={item.icon}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
