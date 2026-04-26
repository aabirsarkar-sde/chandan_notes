"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, ImageIcon, Pin } from "lucide-react";
import Image from "next/image";
import { formatNoteDate, linkifyText, noteColorClasses } from "@/lib/notes";
import type { KeepNote } from "@/lib/types";

type NoteCardProps = {
  note: KeepNote;
};

const TEXT_OVERRIDES_STORAGE_KEY = "keep_archive_text_overrides";

export function NoteCard({ note }: NoteCardProps) {
  const [editableText, setEditableText] = useState(note.text || "");
  const [copied, setCopied] = useState(false);
  const editedDate = formatNoteDate(note.editedAt || note.createdAt);
  const hasBody = Boolean(editableText || note.listItems.length || note.annotations.length);

  useEffect(() => {
    const savedOverrides = readTextOverrides();
    setEditableText(savedOverrides[note.id] ?? note.text ?? "");
  }, [note.id, note.text]);

  useEffect(() => {
    const savedOverrides = readTextOverrides();
    const originalText = note.text || "";

    if (editableText === originalText) {
      if (savedOverrides[note.id]) {
        delete savedOverrides[note.id];
        writeTextOverrides(savedOverrides);
      }
      return;
    }

    savedOverrides[note.id] = editableText;
    writeTextOverrides(savedOverrides);
  }, [editableText, note.id, note.text]);

  async function handleCopy() {
    if (!editableText) {
      return;
    }

    await navigator.clipboard.writeText(editableText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article
      className={`mb-5 break-inside-avoid overflow-hidden rounded-3xl border shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${noteColorClasses[note.color]}`}
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
          <div className="space-y-2">
            <div className="flex items-center justify-end">
              <button
                aria-label="Copy note text"
                className="inline-flex items-center gap-1 rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium transition hover:bg-black/5 dark:hover:bg-white/10"
                onClick={handleCopy}
                type="button"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              className="min-h-0 w-full resize-none bg-transparent p-0 text-sm leading-6 opacity-90 outline-none"
              onChange={(event) => setEditableText(event.target.value)}
              spellCheck={false}
              value={editableText}
            />
          </div>
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
        </footer>
      </div>
    </article>
  );
}

function readTextOverrides(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(TEXT_OVERRIDES_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function writeTextOverrides(overrides: Record<string, string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TEXT_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
}
