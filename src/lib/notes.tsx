import type { KeepNote, NoteColor } from "@/lib/types";

export const noteColorClasses: Record<NoteColor, string> = {
  default:
    "border-stone-200/80 bg-white text-stone-950 shadow-stone-200/70 dark:border-white/10 dark:bg-stone-900 dark:text-stone-50 dark:shadow-black/20",
  blue: "border-blue-200/80 bg-blue-50 text-blue-950 shadow-blue-200/70 dark:border-blue-400/20 dark:bg-blue-950/50 dark:text-blue-50 dark:shadow-black/20",
  brown:
    "border-amber-200/80 bg-amber-100 text-amber-950 shadow-amber-200/70 dark:border-amber-500/20 dark:bg-amber-950/50 dark:text-amber-50 dark:shadow-black/20",
  cerulean:
    "border-cyan-200/80 bg-cyan-50 text-cyan-950 shadow-cyan-200/70 dark:border-cyan-400/20 dark:bg-cyan-950/50 dark:text-cyan-50 dark:shadow-black/20",
  gray: "border-slate-200/80 bg-slate-100 text-slate-950 shadow-slate-200/70 dark:border-slate-400/20 dark:bg-slate-900 dark:text-slate-50 dark:shadow-black/20",
  green:
    "border-emerald-200/80 bg-emerald-50 text-emerald-950 shadow-emerald-200/70 dark:border-emerald-400/20 dark:bg-emerald-950/50 dark:text-emerald-50 dark:shadow-black/20",
  pink: "border-pink-200/80 bg-pink-50 text-pink-950 shadow-pink-200/70 dark:border-pink-400/20 dark:bg-pink-950/50 dark:text-pink-50 dark:shadow-black/20",
  purple:
    "border-purple-200/80 bg-purple-50 text-purple-950 shadow-purple-200/70 dark:border-purple-400/20 dark:bg-purple-950/50 dark:text-purple-50 dark:shadow-black/20",
  teal: "border-teal-200/80 bg-teal-50 text-teal-950 shadow-teal-200/70 dark:border-teal-400/20 dark:bg-teal-950/50 dark:text-teal-50 dark:shadow-black/20",
  yellow:
    "border-yellow-200/80 bg-yellow-50 text-yellow-950 shadow-yellow-200/70 dark:border-yellow-400/20 dark:bg-yellow-950/50 dark:text-yellow-50 dark:shadow-black/20",
};

export function formatNoteDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getNoteText(note: KeepNote) {
  return [note.title, note.text, note.preview, note.labels.join(" "), note.searchText]
    .join(" ")
    .toLowerCase();
}

export function getLabelCounts(notes: KeepNote[]) {
  return notes.reduce<Record<string, number>>((counts, note) => {
    note.labels.forEach((label) => {
      counts[label] = (counts[label] || 0) + 1;
    });

    return counts;
  }, {});
}

export function linkifyText(text: string) {
  const segments = text.split(/(https?:\/\/[^\s]+)/g);

  return segments.map((segment, index) => {
    if (!segment.match(/^https?:\/\//)) {
      return segment;
    }

    return (
      <a
        className="font-medium text-blue-700 underline decoration-blue-400/50 underline-offset-4 transition hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
        href={segment}
        key={`${segment}-${index}`}
        rel="noreferrer"
        target="_blank"
      >
        {segment}
      </a>
    );
  });
}
