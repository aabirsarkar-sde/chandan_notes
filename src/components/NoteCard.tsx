"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, ImageIcon, Pin, Trash2 } from "lucide-react";
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
  const [draftListItems, setDraftListItems] = useState(note.listItems);
  const [focusField, setFocusField] = useState<"title" | "body">("body");
  const cardRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const listItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const draftTitleRef = useRef(note.title);
  const draftTextRef = useRef(note.text);

  const editedDate = formatNoteDate(note.editedAt || note.createdAt);
  const bodyText = getNoteBody(note);
  const hasBody = Boolean(bodyText || note.annotations.length);
  const isChecklist = draftListItems.length > 0;

  useEffect(() => {
    draftTitleRef.current = note.title;
    draftTextRef.current = note.text;
    setDraftListItems(note.listItems);
    listItemRefs.current = [];
  }, [note]);

  useEffect(() => {
    if (!editing) {
      return;
    }

    const target =
      focusField === "title"
        ? titleRef.current
        : draftListItems.length > 0
          ? listItemRefs.current[0]
          : bodyRef.current;

    focusEditableEnd(target);
  }, [editing, focusField, draftListItems.length]);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parts = [];
    if (note.title) parts.push(note.title);
    if (bodyText) parts.push(bodyText);

    navigator.clipboard.writeText(parts.join("\n\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(note.id);
  };

  const startEditing = (field: "title" | "body") => {
    draftTitleRef.current = note.title;
    draftTextRef.current = note.text;
    setDraftListItems(note.listItems);
    setFocusField(field);
    setEditing(true);
  };

  const snapshotChecklistItems = useCallback(
    () =>
    draftListItems
      .map((item, index) => ({
        ...item,
        text: extractEditableText(listItemRefs.current[index]) || item.text,
      }))
      .filter((item) => item.text.trim()),
    [draftListItems]
  );

  const handleSave = useCallback(() => {
    const normalizedTitle = (extractEditableText(titleRef.current) || draftTitleRef.current).trim();

    if (draftListItems.length > 0) {
      onUpdate({
        ...note,
        title: normalizedTitle,
        text: "",
        listItems: snapshotChecklistItems(),
        editedAt: new Date().toISOString(),
      });
      setEditing(false);
      return;
    }

    const normalizedText = (extractEditableText(bodyRef.current) || draftTextRef.current).trim();
    onUpdate({
      ...note,
      title: normalizedTitle,
      text: normalizedText,
      listItems: [],
      editedAt: new Date().toISOString(),
    });
    setEditing(false);
  }, [draftListItems, note, onUpdate, snapshotChecklistItems]);

  useEffect(() => {
    if (!editing) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [editing, handleSave]);

  const handleCancel = () => {
    draftTitleRef.current = note.title;
    draftTextRef.current = note.text;
    setDraftListItems(note.listItems);
    setEditing(false);
  };

  const handleCommonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const toggleChecklistItem = (index: number) => {
    const nextItems = snapshotChecklistItems();
    if (!nextItems[index]) {
      return;
    }

    nextItems[index] = {
      ...nextItems[index],
      checked: !nextItems[index].checked,
    };
    setDraftListItems(nextItems);
  };

  return (
    <article
      ref={cardRef}
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
          {editing ? (
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                draftTitleRef.current = extractEditableText(e.currentTarget);
              }}
              onKeyDown={handleCommonKeyDown}
              className="min-w-0 flex-1 cursor-text whitespace-pre-wrap break-words bg-transparent text-lg font-semibold leading-snug tracking-tight outline-none"
            >
              {draftTitleRef.current}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEditing("title")}
              className="min-w-0 flex-1 text-left text-lg font-semibold leading-snug tracking-tight"
            >
              {note.title}
            </button>
          )}
          {note.pinned ? (
            <span className="rounded-full bg-black/10 p-2 text-current dark:bg-white/10">
              <Pin aria-label="Pinned note" className="h-4 w-4 fill-current" />
            </span>
          ) : null}
        </div>

        {editing && isChecklist ? (
          <ul className="space-y-2">
            {draftListItems.map((item, index) => (
              <li className="flex gap-3 text-sm leading-6" key={`${index}-${item.text}`}>
                <button
                  type="button"
                  onClick={() => toggleChecklistItem(index)}
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    item.checked
                      ? "border-current bg-current text-white dark:text-stone-900"
                      : "border-current/30"
                  }`}
                  aria-label={item.checked ? "Mark unchecked" : "Mark checked"}
                >
                  {item.checked ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
                <div
                  ref={(element) => {
                    listItemRefs.current[index] = element;
                  }}
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleCommonKeyDown}
                  className={`min-w-0 flex-1 cursor-text whitespace-pre-wrap break-words bg-transparent outline-none ${
                    item.checked ? "opacity-60 line-through" : "opacity-90"
                  }`}
                >
                  {item.text}
                </div>
              </li>
            ))}
          </ul>
        ) : editing ? (
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              draftTextRef.current = extractEditableText(e.currentTarget);
            }}
            onKeyDown={handleCommonKeyDown}
            className="min-h-6 cursor-text whitespace-pre-wrap break-words bg-transparent text-sm leading-6 opacity-90 outline-none"
          >
            {draftTextRef.current}
          </div>
        ) : note.listItems.length > 0 ? (
          <div onClick={() => startEditing("body")} className="block w-full cursor-text text-left">
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
          </div>
        ) : bodyText ? (
          <div
            onClick={() => startEditing("body")}
            className="block w-full cursor-text whitespace-pre-wrap text-left text-sm leading-6 opacity-85"
          >
            {linkifyText(bodyText)}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => startEditing("body")}
            className="block w-full cursor-text text-left text-sm leading-6 opacity-45"
          >
            Click to add text
          </button>
        )}

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
  );
}

function getNoteBody(note: KeepNote) {
  if (note.text) {
    return note.text;
  }

  return note.listItems.map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.text}`).join("\n");
}

function extractEditableText(element: HTMLElement | null) {
  return (element?.innerText ?? "").replace(/\u00A0/g, " ").replace(/\r/g, "");
}

function focusEditableEnd(element: HTMLElement | null) {
  if (!element) {
    return;
  }

  element.focus();

  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}
