"use client";

import Masonry from "react-masonry-css";
import { NoteCard } from "@/components/NoteCard";
import type { KeepNote } from "@/lib/types";

type MasonryGridProps = {
  notes: KeepNote[];
  onDelete: (id: string) => void;
  onUpdate: (note: KeepNote) => void;
};

const breakpoints = {
  default: 4,
  1536: 3,
  1100: 2,
  720: 1,
};

export function MasonryGrid({ notes, onDelete, onUpdate }: MasonryGridProps) {
  if (notes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-10 text-center text-stone-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-stone-400">
        No notes match the current filters.
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={breakpoints}
      className="-ml-5 flex w-auto"
      columnClassName="pl-5 bg-clip-padding"
    >
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </Masonry>
  );
}
