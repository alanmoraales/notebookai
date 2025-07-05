"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { db, Note } from "@/app/database";
import { useEffect } from "react";

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
          "h-full p-4 prose dark:prose-invert min-w-[65ch] @max-[65ch]:min-w-[100cqw] focus-visible:outline-none",
      },
    },
    onBlur: ({ editor }) => {
      db.notes.put({
        id: note.id,
        title: note.title,
        content: editor.getHTML(),
        createdAt: note.createdAt,
        updatedAt: Date.now(),
      });
    },
  });

  useEffect(() => {
    if (editor && note) {
      editor.commands.setContent(note.content);
    }
  }, [note, editor]);

  return <EditorContent editor={editor} />;
};

export default Editor;
