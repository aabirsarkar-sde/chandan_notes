import { Archive, Moon, Search, Sun } from "lucide-react";

type SearchBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  showArchived: boolean;
  onShowArchivedChange: (showArchived: boolean) => void;
  darkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
};

export function SearchBar({
  query,
  onQueryChange,
  showArchived,
  onShowArchivedChange,
  darkMode,
  onDarkModeChange,
}: SearchBarProps) {
  return (
    <div className="sticky top-4 z-20 rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-2xl shadow-stone-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-stone-950/75 dark:shadow-black/30">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            className="h-12 w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60 dark:border-white/10 dark:bg-white/5 dark:text-stone-50 dark:focus:border-amber-300 dark:focus:ring-amber-300/10"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search titles, links, labels, and note text..."
            type="search"
            value={query}
          />
        </label>

        <div className="flex gap-2">
          <button
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition ${
              showArchived
                ? "bg-stone-950 text-white dark:bg-white dark:text-stone-950"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-white/10 dark:text-stone-200 dark:hover:bg-white/15"
            }`}
            onClick={() => onShowArchivedChange(!showArchived)}
            type="button"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Archived" : "Active"}
          </button>

          <button
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 transition hover:bg-stone-200 dark:bg-white/10 dark:text-stone-200 dark:hover:bg-white/15"
            onClick={() => onDarkModeChange(!darkMode)}
            type="button"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle dark mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
