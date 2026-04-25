const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.resolve(__dirname, "..");
const sourceRoot = path.resolve(appRoot, "..");
const dataDir = path.join(appRoot, "src", "data");
const attachmentDir = path.join(appRoot, "public", "attachments");

const KEEP_COLORS = {
  DEFAULT: "default",
  BLUE: "blue",
  BROWN: "brown",
  CERULEAN: "cerulean",
  GRAY: "gray",
  GREEN: "green",
  PINK: "pink",
  PURPLE: "purple",
  TEAL: "teal",
  YELLOW: "yellow",
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function toIsoTimestamp(value) {
  if (!value) {
    return null;
  }

  return new Date(Number(value) / 1000).toISOString();
}

function getPreview(note) {
  if (note.textContent?.trim()) {
    return note.textContent.trim().replace(/\s+/g, " ").slice(0, 180);
  }

  if (Array.isArray(note.listContent)) {
    return note.listContent
      .map((item) => item.text?.trim())
      .filter(Boolean)
      .join(" • ")
      .slice(0, 180);
  }

  return "";
}

function getSearchText(note) {
  const listText = Array.isArray(note.listContent)
    ? note.listContent.map((item) => item.text || "").join(" ")
    : "";
  const labels = Array.isArray(note.labels)
    ? note.labels.map((label) => label.name || "").join(" ")
    : "";
  const annotations = Array.isArray(note.annotations)
    ? note.annotations
        .map((annotation) =>
          [annotation.title, annotation.description, annotation.url]
            .filter(Boolean)
            .join(" "),
        )
        .join(" ")
    : "";

  return [note.title, note.textContent, listText, labels, annotations]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function copyAttachment(filePath) {
  const sourcePath = path.join(sourceRoot, filePath);
  const targetPath = path.join(attachmentDir, filePath);

  if (!fs.existsSync(sourcePath)) {
    return null;
  }

  fs.copyFileSync(sourcePath, targetPath);

  return `/attachments/${encodeURIComponent(filePath)}`;
}

function readKeepFiles() {
  return fs
    .readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function parseNote(fileName, index) {
  const filePath = path.join(sourceRoot, fileName);
  const rawNote = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const title = rawNote.title?.trim() || "Untitled note";
  const labels = Array.isArray(rawNote.labels)
    ? rawNote.labels.map((label) => label.name).filter(Boolean)
    : [];
  const listItems = Array.isArray(rawNote.listContent)
    ? rawNote.listContent
        .map((item) => ({
          text: item.text?.trim() || "",
          checked: Boolean(item.isChecked),
        }))
        .filter((item) => item.text)
    : [];
  const attachments = Array.isArray(rawNote.attachments)
    ? rawNote.attachments
        .map((attachment) => {
          const src = copyAttachment(attachment.filePath);

          if (!src) {
            return null;
          }

          return {
            fileName: attachment.filePath,
            mimeType: attachment.mimetype || "application/octet-stream",
            src,
          };
        })
        .filter(Boolean)
    : [];
  const annotations = Array.isArray(rawNote.annotations)
    ? rawNote.annotations
        .map((annotation) => ({
          title: annotation.title || "",
          description: annotation.description || "",
          url: annotation.url || "",
        }))
        .filter((annotation) => annotation.title || annotation.url)
    : [];
  const note = {
    id: `${index}-${fileName.replace(/\.json$/, "")}`,
    sourceFile: fileName,
    title,
    text: rawNote.textContent?.trim() || "",
    listItems,
    labels,
    color: KEEP_COLORS[rawNote.color] || "default",
    keepColor: rawNote.color || "DEFAULT",
    pinned: Boolean(rawNote.isPinned),
    archived: Boolean(rawNote.isArchived),
    createdAt: toIsoTimestamp(rawNote.createdTimestampUsec),
    editedAt: toIsoTimestamp(rawNote.userEditedTimestampUsec),
    attachments,
    annotations,
    preview: getPreview(rawNote),
  };

  return {
    ...note,
    searchText: getSearchText(rawNote),
  };
}

function buildArchive() {
  ensureDir(dataDir);
  ensureDir(attachmentDir);

  const notes = readKeepFiles().map(parseNote);
  const labels = Array.from(new Set(notes.flatMap((note) => note.labels))).sort(
    (a, b) => a.localeCompare(b),
  );
  const colorCounts = notes.reduce((counts, note) => {
    counts[note.color] = (counts[note.color] || 0) + 1;
    return counts;
  }, {});
  const stats = {
    total: notes.length,
    pinned: notes.filter((note) => note.pinned).length,
    archived: notes.filter((note) => note.archived).length,
    labels: labels.length,
    attachments: notes.reduce((sum, note) => sum + note.attachments.length, 0),
    colors: colorCounts,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(dataDir, "notes.json"),
    JSON.stringify({ notes, labels, stats }, null, 2),
  );

  console.log(
    `Processed ${stats.total} notes, ${stats.labels} labels, and ${stats.attachments} attachments.`,
  );
}

buildArchive();
