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
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const notes = useLiveQuery(() =>
    db.notes.toArray().then((notes) => {
      // Order by createdAt descending to show the most recently created note first
      return notes.sort((a, b) => b.createdAt - a.createdAt);
    })
  );
  const [selectedNoteId, setSelectedNoteId] = useState<number | undefined>(
    undefined
  );
  const [addingNote, setAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<Note | undefined>(
    undefined
  );
  const [editNote, setEditNote] = useState<Note | undefined>(undefined);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const selectedNote = useMemo(() => {
    return notes?.find((note) => note.id === selectedNoteId);
  }, [notes, selectedNoteId]);

  useEffect(() => {
    getInitialNote().then((note) => setSelectedNoteId(note.id));
  }, []);

  useEffect(() => {
    const addNoteShortcuts = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAddingNote(false);
        setNewNoteTitle("");
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (newNoteTitle.trim() !== "") {
          const newNoteId = await db.notes.add({
            title: newNoteTitle,
            content: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          setSelectedNoteId(newNoteId);
          setAddingNote(false);
          setNewNoteTitle("");
        }
      }
    };
    if (addingNote) {
      document.addEventListener("keydown", addNoteShortcuts);
    } else {
      document.removeEventListener("keydown", addNoteShortcuts);
    }
    return () => {
      document.removeEventListener("keydown", addNoteShortcuts);
    };
  }, [addingNote, newNoteTitle]);

  useEffect(() => {
    const editNoteShortcuts = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setEditNote(undefined);
        setEditNoteTitle("");
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (editNote && editNoteTitle.trim() !== "") {
          await db.notes.update(editNote.id, {
            title: editNoteTitle,
          });
        }
        setEditNote(undefined);
        setEditNoteTitle("");
      }
    };
    if (editNote) {
      document.addEventListener("keydown", editNoteShortcuts);
    } else {
      document.removeEventListener("keydown", editNoteShortcuts);
    }
    return () => {
      document.removeEventListener("keydown", editNoteShortcuts);
    };
  }, [editNote, editNoteTitle]);

  useEffect(() => {
    if (editNote) {
      requestAnimationFrame(() => {
        const editNoteInput = document.getElementById(
          `edit-note-${editNote.id}`
        );
        if (editNoteInput) {
          (editNoteInput as HTMLInputElement).focus();
          (editNoteInput as HTMLInputElement).select();
        }
      });
    }
  }, [editNote]);

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20}>
          <aside className="flex flex-col justify-between h-full">
            <div className="grid gap-4">
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
                  <Input
                    className="rounded-none"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    autoFocus
                    placeholder="New Note"
                    onBlur={async () => {
                      if (newNoteTitle.trim() !== "") {
                        const newNoteId = await db.notes.add({
                          title: newNoteTitle,
                          content: "",
                          createdAt: Date.now(),
                          updatedAt: Date.now(),
                        });
                        setSelectedNoteId(newNoteId);
                        setAddingNote(false);
                        setNewNoteTitle("");
                      }
                    }}
                  />
                )}
                {notes?.map((note) => {
                  const isSelected = selectedNoteId === note.id;
                  return (
                    <ContextMenu key={note.id}>
                      {editNote?.id === note.id ? (
                        <Input
                          id={`edit-note-${note.id}`}
                          className="rounded-none"
                          defaultValue={note.title}
                          onChange={(e) => setEditNoteTitle(e.target.value)}
                          placeholder="Rename Note"
                          onBlur={async () => {
                            if (editNoteTitle.trim() !== "") {
                              await db.notes.update(note.id, {
                                title: editNoteTitle,
                              });
                            }
                            setEditNote(undefined);
                            setEditNoteTitle("");
                          }}
                        />
                      ) : (
                        <ContextMenuTrigger className="data-[state=open]:*:bg-accent">
                          <Button
                            key={note.id}
                            onClick={() => setSelectedNoteId(note.id)}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start rounded-none border-r-0",
                              isSelected && "bg-accent"
                            )}
                          >
                            {note.title}
                          </Button>
                        </ContextMenuTrigger>
                      )}

                      <ContextMenuContent>
                        <ContextMenuItem
                          onSelect={() => {
                            setEditNote(note);
                          }}
                        >
                          Rename
                          <ContextMenuShortcut>E</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem
                          variant="destructive"
                          onSelect={() => {
                            setConfirmDeleteNote(note);
                          }}
                        >
                          Delete
                          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end p-4">
              <ThemeToggle />
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
      {confirmDeleteNote && (
        <AlertDialog
          open={!!confirmDeleteNote}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setConfirmDeleteNote(undefined);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Note</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this note{" "}
                {`"${confirmDeleteNote.title}"`}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-muted hover:bg-muted/90"
                onClick={() => {
                  setConfirmDeleteNote(undefined);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  db.notes.delete(confirmDeleteNote.id);
                  setConfirmDeleteNote(undefined);
                  if (selectedNoteId === confirmDeleteNote.id) {
                    setSelectedNoteId(undefined);
                  }
                }}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default HomePage;
