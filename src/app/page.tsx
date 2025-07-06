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
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [addingNote, setAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<Note | undefined>(
    undefined
  );
  const [editNote, setEditNote] = useState<Note | undefined>(undefined);
  const [editNoteTitle, setEditNoteTitle] = useState("");

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

  useEffect(() => {
    const cancelEditNote = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setEditNote(undefined);
        setEditNoteTitle("");
      }
    };
    if (editNote) {
      document.addEventListener("keydown", cancelEditNote);
    } else {
      document.removeEventListener("keydown", cancelEditNote);
    }
    return () => {
      document.removeEventListener("keydown", cancelEditNote);
    };
  }, [editNote]);

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
              )}
              {notes?.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <ContextMenu
                    key={note.id}
                    // onOpenChange={(isOpen) => {
                    //   const shortcutsEventListeners = (e: KeyboardEvent) => {
                    //     if (e.key === "Delete") {
                    //       e.preventDefault();
                    //       setConfirmDeleteNote(note);
                    //     }
                    //     if (e.key === "E") {
                    //       e.preventDefault();
                    //       setEditNote(note);
                    //     }
                    //   };
                    //   if (isOpen) {
                    //     document.addEventListener(
                    //       "keydown",
                    //       shortcutsEventListeners
                    //     );
                    //   } else {
                    //     document.removeEventListener(
                    //       "keydown",
                    //       shortcutsEventListeners
                    //     );
                    //   }
                    // }}
                  >
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
                          onClick={() => setSelectedNote(note)}
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
                  if (selectedNote?.id === confirmDeleteNote.id) {
                    setSelectedNote(undefined);
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
