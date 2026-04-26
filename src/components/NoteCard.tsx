"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, ImageIcon, Pin } from "lucide-react";
import Image from "next/image";
import { formatNoteDate, linkifyText, noteColorClasses } from "@/lib/notes";
import type { KeepNote } from "@/lib/types";

type NoteCardProps = {
  note: KeepNote;
};

export function NoteCard({ note }: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const editedDate = formatNoteDate(note.editedAt || note.createdAt);
  const hasBody = Boolean(note.text || note.listItems.length || note.annotations.length);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const parts = [];
    if (note.title) parts.push(note.title);
    if (note.text) parts.push(note.text);
    if (note.listItems.length > 0) {
      parts.push(
        note.listItems.map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.text}`).join("\n")
      );
    }
    
    navigator.clipboard.writeText(parts.join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={`mb-5 break-inside-avoid overflow-hidden rounded-3xl border shadow-lg transition duration-300 hover:shadow-xl group ${noteColorClasses[note.color]}`}
    >
      {note.attachments.length > 0 ? (
        <div className="grid gap-1 bg-black/5 p-1 dark:bg-white/5">
          {note.attachments.map((attachment) => (
            <Image
              alt={note.title}
              className="max-h-80 w-full rounded-2xl object-cover"
              height={800}
              key={attachment.fileName}
              loading="lazy"
              src={attachment.src}
              width={1200}
            />
          ))}
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <h2 className="min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight">
            {note.title}
          </h2>
          {note.pinned ? (
            <span className="rounded-full bg-black/10 p-2 text-current dark:bg-white/10">
              <Pin aria-label="Pinned note" className="h-4 w-4 fill-current" />
            </span>
          ) : null}
        </div>

        {note.text ? (
          <p className="whitespace-pre-wrap text-sm leading-6 opacity-85">
            {linkifyText(note.text)}
          </p>
        ) : null}

        {note.listItems.length > 0 ? (
          <ul className="space-y-2">
            {note.listItems.map((item, index) => (
              <li className="flex gap-3 text-sm leading-6" key={`${item.text}-${index}`}>
                <span
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    item.checked
                      ? "border-current bg-current text-white dark:text-stone-900"
                      : "border-current/30"
                  }`}
                >
                  {item.checked ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
                <span className={item.checked ? "opacity-60 line-through" : "opacity-90"}>
                  {linkifyText(item.text)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {note.annotations.length > 0 ? (
          <div className="space-y-2">
            {note.annotations.map((annotation) => (
              <a
                className="flex items-center gap-3 rounded-2xl border border-current/10 bg-white/45 p-3 text-sm transition hover:bg-white/70 dark:bg-black/15 dark:hover:bg-black/25"
                href={annotation.url}
                key={`${annotation.title}-${annotation.url}`}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {annotation.title || annotation.url}
                  </span>
                  {annotation.url ? (
                    <span className="block truncate text-xs opacity-65">{annotation.url}</span>
                  ) : null}
                </span>
              </a>
            ))}
          </div>
        ) : null}

        {!hasBody && note.attachments.length > 0 ? (
          <div className="flex items-center gap-2 text-sm opacity-70">
            <ImageIcon className="h-4 w-4" />
            <span>{note.attachments.length} image attachment(s)</span>
          </div>
        ) : null}

        <footer className="flex flex-wrap items-center gap-2 border-t border-current/10 pt-4 text-xs opacity-70">
          <span>Edited {editedDate}</span>
          {note.archived ? <span>Archived</span> : null}
          {note.labels.map((label) => (
            <span
              className="rounded-full bg-black/10 px-2.5 py-1 font-medium dark:bg-white/10"
              key={label}
            >
              {label}
            </span>
          ))}
          <div className="ml-auto">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Copy note"
              aria-label="Copy note text"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}
