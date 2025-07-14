import Dexie, { type EntityTable } from "dexie";
import dexieCloud from "dexie-cloud-addon";
import environment from "@/services/environment";

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const db = new Dexie("NotebookDatabase", {
  addons: [dexieCloud],
}) as Dexie & {
  notes: EntityTable<
    Note,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(2).stores({
  notes: "@id, title, content, createdAt, updatedAt", // primary key "id" (for the runtime!)
});

db.cloud.configure({
  databaseUrl: environment.dexieCloudUrl,
  requireAuth: true // optional
});

export type { Note };
export { db };
