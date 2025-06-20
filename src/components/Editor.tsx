"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";

const Editor = () => {
  const editor = useEditor({
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
        class: "h-full p-4 prose dark:prose-invert w-[65ch]",
      },
    },
  });

  return <EditorContent editor={editor} />;
};

export default Editor;
