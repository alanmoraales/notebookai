"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { db, Note } from "@/app/database";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { GripVertical, Bold, Italic, Strikethrough } from "lucide-react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Button } from "./ui/button";
import { useState } from "react";

const Editor = ({ note }: { note: Note }) => {
  const editor = useEditor({
    content: note.content,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem,
      Placeholder.configure({
        placeholder: "Write something …",
      }),
    ],
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "h-full prose dark:prose-invert min-w-[65ch] @max-[65ch]:min-w-[100cqw] focus-visible:outline-none border-l-[30px] border-transparent transform -translate-x-[30px]",
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
    requestAnimationFrame(() => {
      const editNoteInput = document.getElementById(
        `edit-note-title-${note.id}`
      );
      if (editNoteInput) {
        (editNoteInput as HTMLInputElement).value = note.title;
      }
    });
  }, [note]);
  const [menuState, setMenuState] = useState({
    bold: false,
    italic: false,
    strike: false,
  });

  return (
    <div className="h-full grid gap-4 grid-rows-[auto_1fr] py-14 px-8">
      <Input
        id={`edit-note-title-${note.id}`}
        defaultValue={note.title}
        className="bg-transparent! rounded-none px-0 text-3xl! font-bold! focus-visible:outline-none! border-0 shadow-none focus-visible:ring-0 focus-visible:shadow-none"
        onBlur={(e) => {
          db.notes.update(note.id, { title: e.target.value });
        }}
      />
      {editor && (
        <DragHandle editor={editor} className="cursor-grab">
          <div className="relative grid place-items-center pr-1 mt-[30%]">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </DragHandle>
      )}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, state }) => {
            const shouldShow =
              !state.selection.empty && state.selection.visible;
            if (shouldShow) {
              setMenuState({
                bold: editor.isActive("bold"),
                italic: editor.isActive("italic"),
                strike: editor.isActive("strike"),
              });
            }
            return shouldShow;
          }}
          options={{ placement: "top", offset: 8 }}
        >
          <div className="bubble-menu bg-stone-900 rounded-md p-1 shadow-md flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={menuState.bold ? "bg-accent/50" : ""}
            >
              <Bold />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={menuState.italic ? "bg-accent/50" : ""}
            >
              <Italic />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={menuState.strike ? "bg-accent/50" : ""}
            >
              <Strikethrough />
            </Button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
