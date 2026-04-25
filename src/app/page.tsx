import { ArchiveApp } from "@/components/ArchiveApp";
import archive from "@/data/notes.json";
import type { NotesArchive } from "@/lib/types";

export default function Home() {
  return <ArchiveApp archive={archive as NotesArchive} />;
}
