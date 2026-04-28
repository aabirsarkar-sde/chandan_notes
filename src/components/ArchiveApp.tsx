"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MasonryGrid } from "@/components/MasonryGrid";
import { SearchBar } from "@/components/SearchBar";
import { Sidebar } from "@/components/Sidebar";
import { getLabelCounts, getNoteText } from "@/lib/notes";
import type { KeepNote, NotesArchive } from "@/lib/types";

type ArchiveAppProps = {
  archive: NotesArchive;
};

export function ArchiveApp({ archive }: ArchiveAppProps) {
  const [notes, setNotes] = useState<KeepNote[]>(archive.notes);
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverrides() {
      try {
        const response = await fetch("/api/notes", { signal: controller.signal });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          overrides: Array<{
            id: string;
            title: string | null;
            text: string | null;
            listItems: KeepNote["listItems"] | null;
            deleted: boolean;
          }>;
        };

        const byId = new Map(data.overrides.map((item) => [item.id, item]));
        setNotes(() =>
          archive.notes
            .filter((note) => !byId.get(note.id)?.deleted)
            .map((note) => {
              const override = byId.get(note.id);
              if (!override) {
                return note;
              }

              return {
                ...note,
                title: override.title ?? note.title,
                text: override.text ?? note.text,
                listItems: override.listItems ?? note.listItems,
              };
            })
        );
      } catch {
        // Ignore network errors and fall back to bundled notes.
      }
    }

    void loadOverrides();
    return () => controller.abort();
  }, [archive.notes]);

  const handleDelete = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    void fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const handleUpdate = useCallback((updated: KeepNote) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    void fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: updated.id,
        title: updated.title,
        text: updated.text,
        listItems: updated.listItems,
      }),
    });
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const labelCounts = useMemo(() => getLabelCounts(notes), [notes]);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => note.archived === showArchived)
      .filter((note) => !selectedLabel || note.labels.includes(selectedLabel))
      .filter((note) => !normalizedQuery || getNoteText(note).includes(normalizedQuery))
      .sort(sortNotes);
  }, [notes, normalizedQuery, selectedLabel, showArchived]);

  const pinnedNotes = filteredNotes.filter((note) => note.pinned);
  const otherNotes = filteredNotes.filter((note) => !note.pinned);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fde68a_0,_transparent_34rem),linear-gradient(135deg,_#fafaf9,_#f5f5f4_45%,_#e7e5e4)] px-4 py-6 text-stone-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22)_0,_transparent_32rem),linear-gradient(135deg,_#0c0a09,_#1c1917_55%,_#0a0a0a)] dark:text-stone-50 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[96rem] gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Sidebar
          labelCounts={labelCounts}
          labels={archive.labels}
          onLabelChange={setSelectedLabel}
          selectedLabel={selectedLabel}
          stats={archive.stats}
        />

        <section className="min-w-0 space-y-6">
          <SearchBar
            darkMode={darkMode}
            onDarkModeChange={setDarkMode}
            onQueryChange={setQuery}
            onShowArchivedChange={setShowArchived}
            query={query}
            showArchived={showArchived}
          />

          <div className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-xl shadow-stone-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-stone-950/50 dark:shadow-black/30">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {showArchived ? "Archived notes" : "Active notes"}
                  {selectedLabel ? ` / ${selectedLabel}` : ""}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  {filteredNotes.length.toLocaleString()} note
                  {filteredNotes.length === 1 ? "" : "s"} found
                </h2>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {notes.length.toLocaleString()} notes imported from Google Keep
              </p>
            </div>
          </div>

          {pinnedNotes.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading title="Pinned" count={pinnedNotes.length} />
              <MasonryGrid notes={pinnedNotes} onDelete={handleDelete} onUpdate={handleUpdate} />
            </section>
          ) : null}

          <section className="space-y-4">
            <SectionHeading
              count={otherNotes.length}
              title={pinnedNotes.length > 0 ? "Others" : "Notes"}
            />
            <MasonryGrid notes={otherNotes} onDelete={handleDelete} onUpdate={handleUpdate} />
          </section>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
        {title}
      </h2>
      <span className="rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-stone-500 shadow-sm dark:bg-white/10 dark:text-stone-300">
        {count}
      </span>
    </div>
  );
}

function sortNotes(a: KeepNote, b: KeepNote) {
  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1;
  }

  const aDate = a.editedAt || a.createdAt || "";
  const bDate = b.editedAt || b.createdAt || "";

  return bDate.localeCompare(aDate);
}
