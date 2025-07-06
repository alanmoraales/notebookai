"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { db, Note } from "@/app/database";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";

const Editor = ({ note }: { note: Note }) => {
  const editor = useEditor({
    content: note.content,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something …",
      }),
    ],
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "h-full prose dark:prose-invert min-w-[65ch] @max-[65ch]:min-w-[100cqw] focus-visible:outline-none",
      },
    },
    onBlur: ({ editor }) => {
      db.notes.update(note.id, {
        content: editor.getHTML(),
        updatedAt: Date.now(),
      });
    },
  });

  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
      editor.commands.focus();
    }
  }, [note, editor]);

  useEffect(() => {
    console.log("running update note title effect");
    requestAnimationFrame(() => {
      const editNoteInput = document.getElementById(
        `edit-note-title-${note.id}`
      );
      if (editNoteInput) {
        (editNoteInput as HTMLInputElement).value = note.title;
      }
    });
  }, [note]);

  return (
    <div className="h-full grid gap-4 grid-rows-[auto_1fr] p-4">
      <Input
        id={`edit-note-title-${note.id}`}
        defaultValue={note.title}
        className="rounded-none px-0 text-3xl! font-bold! focus-visible:outline-none! border-0 shadow-none focus-visible:ring-0 focus-visible:shadow-none"
        onBlur={(e) => {
          db.notes.update(note.id, { title: e.target.value });
        }}
      />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
