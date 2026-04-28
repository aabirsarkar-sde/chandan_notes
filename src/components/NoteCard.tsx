"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, ExternalLink, ImageIcon, Pencil, Pin, Trash2, X } from "lucide-react";
import Image from "next/image";
import { formatNoteDate, linkifyText, noteColorClasses } from "@/lib/notes";
import type { KeepNote } from "@/lib/types";

type NoteCardProps = {
  note: KeepNote;
  onDelete: (id: string) => void;
  onUpdate: (note: KeepNote) => void;
};

export function NoteCard({ note, onDelete, onUpdate }: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(note.id);
  };

  return (
    <>
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
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Edit note"
                aria-label="Edit note"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Copy note"
                aria-label="Copy note text"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center rounded-full p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete note"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      </article>

      {editing ? (
        <EditModal
          note={note}
          onSave={(updated) => {
            onUpdate(updated);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </>
  );
}

type EditModalProps = {
  note: KeepNote;
  onSave: (note: KeepNote) => void;
  onClose: () => void;
};

function EditModal({ note, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();
    onSave({
      ...note,
      title: trimmedTitle,
      text: trimmedText,
      editedAt: new Date().toISOString(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl ${noteColorClasses[note.color]} animate-in zoom-in-95 duration-200`}
        onKeyDown={handleKeyDown}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/10 p-2 transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
          aria-label="Close editor"
        >
          <X className="h-5 w-5" />
        </button>

        {note.attachments.length > 0 ? (
          <div className="grid gap-1 bg-black/5 p-1 dark:bg-white/5">
            {note.attachments.map((attachment) => (
              <Image
                alt={note.title}
                className="max-h-64 w-full rounded-2xl object-cover"
                height={800}
                key={attachment.fileName}
                loading="lazy"
                src={attachment.src}
                width={1200}
              />
            ))}
          </div>
        ) : null}

        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest opacity-50">
              Title
            </label>
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full resize-none rounded-2xl border border-current/15 bg-white/50 px-4 py-3 text-xl font-semibold leading-snug tracking-tight placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber-400/60 dark:bg-black/20"
              rows={2}
              placeholder="Title"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest opacity-50">
              Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full resize-y rounded-2xl border border-current/15 bg-white/50 px-4 py-3 text-base leading-7 placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber-400/60 dark:bg-black/20"
              rows={10}
              placeholder="Write your note here..."
            />
          </div>

          <div className="flex items-center justify-between border-t border-current/10 pt-5">
            <p className="text-xs opacity-50">
              {note.pinned ? "Pinned" : ""}{" "}
              {note.labels.length > 0 ? `Labels: ${note.labels.join(", ")}` : ""}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-full bg-black/10 px-5 py-2 text-sm font-semibold transition hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
              >
                Save changes
              </button>
            </div>
          </div>

          <p className="text-center text-xs opacity-40">
            Press Ctrl+Enter to save &middot; Escape to cancel
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
