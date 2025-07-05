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
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [addingNote, setAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");

  useEffect(() => {
    getInitialNote().then((note) => setSelectedNote(note));
  }, []);

  useEffect(() => {
    const cancelAddingNote = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAddingNote(false);
        setNewNoteTitle("");
      }
    };
    if (addingNote) {
      document.addEventListener("keydown", cancelAddingNote);
    } else {
      document.removeEventListener("keydown", cancelAddingNote);
    }
    return () => {
      document.removeEventListener("keydown", cancelAddingNote);
    };
  }, [addingNote]);

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20}>
          <aside className="grid gap-4">
            <div className="flex items-center justify-between pl-4 pt-4">
              <h4 className="text-lg font-medium">Notes</h4>
              <Button
                onClick={() => {
                  setAddingNote(true);
                }}
                variant="ghost"
                size="icon"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
            <div>
              {addingNote && (
                <div>
                  <Input
                    className="rounded-none"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    autoFocus
                    placeholder="New Note"
                    onBlur={async () => {
                      if (newNoteTitle.trim() === "") {
                        setAddingNote(false);
                        setNewNoteTitle("");
                      } else {
                        const newNoteId = await db.notes.add({
                          title: newNoteTitle,
                          content: "",
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                        });
                        setSelectedNote({
                          id: newNoteId,
                          title: newNoteTitle,
                          content: "",
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                        });
                        setAddingNote(false);
                        setNewNoteTitle("");
                      }
                    }}
                  />
                </div>
              )}
              {notes?.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <Button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start rounded-none border-r-0",
                      isSelected && "bg-accent"
                    )}
                  >
                    {note.title}
                  </Button>
                );
              })}
            </div>
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
        {/* <ResizableHandle />
        <ResizablePanel>
          <aside>
            <h4>Chat</h4>
          </aside>
        </ResizablePanel> */}
      </ResizablePanelGroup>
    </div>
  );
};

export default HomePage;
