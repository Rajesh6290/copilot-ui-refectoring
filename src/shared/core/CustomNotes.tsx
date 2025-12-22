"use client";
import { CircularProgress } from "@mui/material";
import { Menu, NotebookPen, PlusCircle, Save, Trash2, X } from "lucide-react";
import moment from "moment";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import useMutation from "../hooks/useMutation";
import usePermission from "../hooks/usePermission";
import useSwr from "../hooks/useSwr";
import { formatDateTime } from "../utils";
import CustomButton from "./CustomButton";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  lastModified: Date;
  doc_id?: string;
}
interface ISAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}

const CustomNotes = ({
  id,
  type,
  isAccess
}: {
  id: string;
  type: string;
  isAccess?: ISAccess | undefined;
}) => {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [isNewlyCreated, setIsNewlyCreated] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const { user, isUserLoading } = usePermission();
  const { data, mutate } = useSwr(`notes?page=1&limit=100&note_type=${type}`);
  const { isLoading, mutation } = useMutation();
  const { mutation: deleteMutation } = useMutation();

  const notes = useMemo(() => {
    if (!data?.notes) {
      return [];
    }
    return data.notes.map(
      (note: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: string;
        title: string;
        note: string;
        created_at: string;
        updated_at: string;
        doc_id: string;
      }) => ({
        id: note._id,
        title: note.title,
        content: note.note,
        createdAt: new Date(note.created_at),
        lastModified: new Date(note.updated_at),
        doc_id: note.doc_id
      })
    );
  }, [data?.notes]);

  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: new Date(),
      lastModified: new Date()
    };

    setActiveNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
    setIsNewlyCreated(true);
  }, []);

  const saveNote = useCallback(async () => {
    if (!activeNote) {
      return;
    }
    try {
      const res = await mutation(`note?note_type=${type}`, {
        method: "POST",
        body: {
          subject_id: id,
          title: title || "Untitled",
          note: content || "not-provided"
        }
      });

      if (res?.status === 201) {
        toast.success("Note saved successfully");
        const savedNote = res.results;
        setActiveNote({
          ...activeNote,
          id: savedNote?.doc_id || activeNote.id,
          doc_id: savedNote?.doc_id,
          createdAt: new Date(savedNote.created_at || activeNote.createdAt),
          lastModified: new Date(
            savedNote.updated_at || activeNote.lastModified
          )
        });
        mutate();
        setIsNewlyCreated(false);
      } else {
        toast.error("Failed to save note");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }, [activeNote, title, content, id, mutation, mutate, type]);
  const updateNote = useCallback(async () => {
    if (!activeNote) {
      return;
    }

    try {
      const res = await mutation(`note?doc_id=${activeNote?.doc_id}`, {
        method: "PUT",
        body: {
          title: title || "Untitled",
          note: content
        }
      });

      if (res?.status === 200) {
        toast.success("Note Updates successfully");
        mutate();
        setIsNewlyCreated(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }, [activeNote, title, content, id, mutation, mutate, type]);

  const deleteNote = useCallback(async () => {
    if (!activeNote) {
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this note?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        const res = await deleteMutation(`note?doc_id=${activeNote.doc_id}`, {
          method: "DELETE"
        });

        if (res?.status === 200) {
          toast.success("Note deleted successfully");
          mutate();
          setActiveNote(null);
          setTitle("");
          setContent("");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
  }, [activeNote, mutation, mutate]);

  const deleteNoteFromList = useCallback(
    async (deleteId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this note?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      });
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const res = await deleteMutation(`note?doc_id=${deleteId}`, {
            method: "DELETE"
          });

          if (res?.status === 200) {
            toast.success("Note deleted successfully");
            mutate();
            if (activeNote?.id === deleteId) {
              setActiveNote(null);
              setTitle("");
              setContent("");
            }
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "An error occurred"
          );
        } finally {
          setLoading(false);
        }
      }
    },
    [activeNote, mutation, mutate, type, id]
  );

  const toggleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, []);

  const selectNote = useCallback((note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
  }, []);

  return (
    <div className="flex size-full w-full">
      <div className="flex size-full flex-col rounded-xl dark:border-neutral-800 md:flex-row">
        <div
          className={`${
            showSidebar ? "w-full md:w-64" : "w-0"
          } flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-neutral-800 dark:bg-darkSidebarBackground ${
            !showSidebar && "hidden"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-800">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Notes
            </h1>
            <button className="rounded-full p-2" aria-label="Toggle dark mode">
              <NotebookPen className="h-5 w-5 dark:text-gray-200" />
            </button>
          </div>
          {isAccess?.buttons[0]?.permission.is_shown && (
            <div className="p-4">
              <CustomButton
                onClick={createNewNote}
                startIcon={<PlusCircle className="h-5 w-5" />}
                className="w-full"
                disabled={!isAccess?.buttons[0]?.permission.actions.create}
              >
                New Note
              </CustomButton>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {notes?.map(
              (note: {
                id: string;
                title: string;
                content: string;
                createdAt: Date;
                lastModified: Date;
                doc_id?: string;
              }) => (
                <div
                  key={note.id}
                  className={`flex cursor-pointer items-center justify-between border-b border-gray-100 p-4 hover:bg-gray-100 dark:border-neutral-800 dark:hover:bg-gray-700 ${
                    activeNote?.id === note.id
                      ? "bg-gray-100 dark:bg-darkMainBackground"
                      : ""
                  }`}
                >
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => selectNote(note)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        selectNote(note);
                      }
                    }}
                    className="flex-1"
                  >
                    <h2 className="line-clamp-1 truncate text-lg font-medium text-gray-800 dark:text-white">
                      {note.title.substring(0, 20) || "Untitled"}
                      {note.title.length > 20 ? "..." : ""}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                      {note.content || "No content"}
                    </p>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      {!isUserLoading &&
                        user &&
                        note?.lastModified &&
                        moment(
                          formatDateTime(note?.lastModified, user?.date_time)
                        ).format("lll")}
                    </p>
                  </div>
                  {isAccess?.buttons[2]?.permission?.is_shown && (
                    <button
                      onClick={(e) => {
                        if (isAccess?.buttons[2]?.permission.actions.delete) {
                          if (note.doc_id) {
                            deleteNoteFromList(note.doc_id, e);
                          }
                        } else {
                          toast.error(
                            "You don't have permission to delete note"
                          );
                        }
                      }}
                      className="ml-2 shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-red-400"
                      title="Delete note"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col">
          <button
            onClick={toggleSidebar}
            className="absolute left-4 top-4 z-10 rounded-full bg-gray-100 p-2 text-gray-800 dark:bg-darkSidebarBackground dark:text-white"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {activeNote ? (
            <>
              <div className="flex flex-col items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-darkSidebarBackground md:flex-row">
                <div className="mb-4 flex w-full items-center md:mb-0">
                  <div className="w-full pl-10">
                    {" "}
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Note Title"
                      className={`w-fit rounded bg-white px-2 py-1 text-xl font-bold text-gray-800 placeholder-gray-400 outline-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 ${
                        isNewlyCreated
                          ? "ring-2 ring-indigo-500 dark:ring-indigo-400"
                          : "focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (isNewlyCreated) {
                        saveNote();
                      } else {
                        if (isAccess?.buttons[1]?.permission.actions.update) {
                          updateNote();
                        } else {
                          toast.error(
                            "You don't have permission to update note"
                          );
                        }
                      }
                    }}
                    className="flex items-center space-x-1 rounded-md bg-tertiary-500 px-3 py-1 text-white hover:bg-tertiary-600 dark:bg-tertiary-600 dark:hover:bg-tertiary-700"
                  >
                    {isLoading ? (
                      <CircularProgress size={18} className="!text-white" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isNewlyCreated ? "Save" : "Update"}</span>
                  </button>
                  {isAccess?.buttons?.[2]?.permission?.is_shown && (
                    <button
                      onClick={() => {
                        if (isAccess?.buttons[2]?.permission.actions.delete) {
                          deleteNote();
                        } else {
                          toast.error(
                            "You don't have permission to delete note"
                          );
                        }
                      }}
                      disabled={loading}
                      className="flex items-center space-x-1 rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                      {loading ? (
                        <CircularProgress size={18} className="!text-white" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4">
                <textarea
                  ref={textAreaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="h-full w-full resize-none rounded-lg bg-gray-50 p-4 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-darkMainBackground dark:text-white dark:placeholder-gray-400 dark:focus:ring-indigo-400"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 text-gray-500 dark:border-neutral-800 dark:bg-darkSidebarBackground dark:text-gray-300">
              <div className="max-w-md p-8 text-center">
                <h2 className="mb-4 text-2xl font-bold">No Note Selected</h2>
                <p className="mb-8">
                  Select an existing note from the sidebar or create a new one
                  to get started.
                </p>
                <CustomButton
                  onClick={createNewNote}
                  startIcon={<PlusCircle className="h-5 w-5" />}
                >
                  Create New Note
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomNotes;
