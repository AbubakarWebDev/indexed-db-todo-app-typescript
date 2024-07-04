import { nanoid } from "nanoid";
import { IDB, IDBSchema } from "./idb";

// ====================================================
//     Indexed DB Implementation Starts From Here
// ====================================================

if (!window.indexedDB) {
  alert("Indexed DB is not supported");
}

const DATABASE_NAME = "main";
const DATABASE_SCHEMA_VER = 2;
const OBJECT_STORE_NAME = "todos";

const idbSchema: IDBSchema = {
  objectStoreName: OBJECT_STORE_NAME,
  objectStoreIndexes: [
    {
      name: "nameIndex",
      keyPath: "name",
      options: { unique: false },
    },
  ],
  objectStoreOptions: {
    keyPath: "id",
  },
};

const idb = new IDB(DATABASE_NAME, DATABASE_SCHEMA_VER, idbSchema);

// ====================================================
//        Indexed DB Implementation End Here
// ====================================================

const todoNameInput = document.getElementById("todo-name") as HTMLInputElement;
const todoImageInput = document.getElementById(
  "todo-image"
) as HTMLInputElement;

document.getElementById("submit-btn")?.addEventListener("click", async () => {
  const todoName = todoNameInput.value;
  const todoImage = todoImageInput.files && todoImageInput.files[0];

  if (!todoName || !todoImage) {
    alert("Please enter valid data");
    return;
  }

  try {
    await idb.createRecord(OBJECT_STORE_NAME, {
      id: nanoid(),
      name: todoName,
      image: todoImage,
    });

    alert("Record successfully added");
    todoNameInput.value = "";
    todoImageInput.value = "";
  } catch (error) {
    alert("Something went wrong. please check browser console for the error");
    console.log(error);
  }
});

document.getElementById("update-btn")?.addEventListener("click", () => {});
document.getElementById("delete-btn")?.addEventListener("click", () => {});
