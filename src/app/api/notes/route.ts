import { NextResponse } from "next/server";
import { ensureNotesTable, listOverrides, markNoteDeleted, upsertNoteEdit } from "@/lib/db";

export async function GET() {
  try {
    await ensureNotesTable();
    const overrides = await listOverrides();
    return NextResponse.json({ overrides });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load overrides" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      title?: string;
      text?: string;
    };

    if (!body.id || typeof body.title !== "string" || typeof body.text !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await ensureNotesTable();
    await upsertNoteEdit({
      id: body.id,
      title: body.title,
      text: body.text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save note" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { id?: string };

    if (!body.id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await ensureNotesTable();
    await markNoteDeleted(body.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete note" },
      { status: 500 }
    );
  }
}
