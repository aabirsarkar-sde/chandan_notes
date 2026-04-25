import { Hash, Layers3, Pin, Tags } from "lucide-react";
import type { ReactNode } from "react";

type SidebarProps = {
  labels: string[];
  labelCounts: Record<string, number>;
  selectedLabel: string | null;
  onLabelChange: (label: string | null) => void;
  stats: {
    total: number;
    pinned: number;
    archived: number;
    labels: number;
    attachments: number;
  };
};

export function Sidebar({
  labels,
  labelCounts,
  selectedLabel,
  onLabelChange,
  stats,
}: SidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-stone-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-stone-950/70 dark:shadow-black/30">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-600 dark:text-amber-300">
            Keep Archive
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950 dark:text-stone-50">
            Your notes, organized.
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">
            A searchable read-only home for your Google Keep Takeout export.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Layers3 className="h-4 w-4" />} label="Notes" value={stats.total} />
          <StatCard icon={<Pin className="h-4 w-4" />} label="Pinned" value={stats.pinned} />
          <StatCard icon={<Tags className="h-4 w-4" />} label="Labels" value={stats.labels} />
          <StatCard icon={<Hash className="h-4 w-4" />} label="Images" value={stats.attachments} />
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-stone-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-stone-950/70 dark:shadow-black/30">
        <div className="mb-3 flex items-center justify-between px-2">
          <h2 className="font-semibold text-stone-950 dark:text-stone-50">Labels</h2>
          <span className="text-xs text-stone-500">{labels.length}</span>
        </div>

        <div className="max-h-[42rem] space-y-1 overflow-auto pr-1">
          <button
            className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
              selectedLabel === null
                ? "bg-stone-950 text-white dark:bg-white dark:text-stone-950"
                : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
            }`}
            onClick={() => onLabelChange(null)}
            type="button"
          >
            <span>All notes</span>
            <span>{stats.total}</span>
          </button>

          {labels.map((label) => (
            <button
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                selectedLabel === label
                  ? "bg-amber-400 text-stone-950"
                  : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
              }`}
              key={label}
              onClick={() => onLabelChange(label)}
              type="button"
            >
              <span className="truncate">{label}</span>
              <span className="ml-3 text-xs opacity-70">{labelCounts[label] || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-stone-100 p-3 text-stone-800 dark:bg-white/10 dark:text-stone-100">
      <div className="mb-2 flex items-center gap-2 text-xs opacity-70">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
