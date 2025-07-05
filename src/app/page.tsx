"use client";

import Editor from "@/components/Editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db, Note } from "./database";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const getInitialNote = async () => {
  const notes = await db.notes.toArray();
  if (notes.length === 0) {
    const newNoteId = await db.notes.add({
      title: "New Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return {
      id: newNoteId,
      title: "New Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
  return notes[0];
};

const HomePage = () => {
  const notes = useLiveQuery(() => db.notes.toArray());
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);

  useEffect(() => {
    getInitialNote().then((note) => setSelectedNote(note));
  }, []);

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20}>
          <aside>
            <h4>Files</h4>
            <Button
              className="w-full justify-start rounded-none border-r-0 mb-6"
              onClick={async () => {
                const newNoteId = await db.notes.add({
                  title: "New Note",
                  content: "",
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
                setSelectedNote({
                  id: newNoteId,
                  title: "New Note",
                  content: "",
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                });
              }}
            >
              Add Notes
            </Button>
            {notes?.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <Button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  variant={isSelected ? "outline" : "ghost"}
                  className="w-full justify-start rounded-none border-r-0"
                >
                  {note.title}
                </Button>
              );
            })}
          </aside>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ScrollArea className="h-screen">
            {selectedNote && (
              <main className="*:@container *:h-full h-screen *:grid *:justify-center">
                <Editor note={selectedNote} />
              </main>
            )}
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <aside>
            <h4>Chat</h4>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default HomePage;
