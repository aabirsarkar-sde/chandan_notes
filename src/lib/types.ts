export type NoteColor =
  | "default"
  | "blue"
  | "brown"
  | "cerulean"
  | "gray"
  | "green"
  | "pink"
  | "purple"
  | "teal"
  | "yellow";

export type NoteAttachment = {
  fileName: string;
  mimeType: string;
  src: string;
};

export type NoteAnnotation = {
  title: string;
  description: string;
  url: string;
};

export type NoteListItem = {
  text: string;
  checked: boolean;
};

export type KeepNote = {
  id: string;
  sourceFile: string;
  title: string;
  text: string;
  listItems: NoteListItem[];
  labels: string[];
  color: NoteColor;
  keepColor: string;
  pinned: boolean;
  archived: boolean;
  createdAt: string | null;
  editedAt: string | null;
  attachments: NoteAttachment[];
  annotations: NoteAnnotation[];
  preview: string;
  searchText: string;
};

export type NotesArchive = {
  notes: KeepNote[];
  labels: string[];
  stats: {
    total: number;
    pinned: number;
    archived: number;
    labels: number;
    attachments: number;
    colors: Record<string, number>;
    generatedAt: string;
  };
};
