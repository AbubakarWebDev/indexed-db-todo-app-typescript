import { nanoid } from "nanoid";

// ====================================================
//     Indexed DB Implementation Starts From Here
// ====================================================

if (window.indexedDB) console.log("Indexed DB is supported");

const DATABASE_VER = 1;
const DATABASE_NAME = "main";
const OBJECT_STORE_NAME = "todos";

let database: IDBDatabase;
const request = indexedDB.open(DATABASE_NAME, DATABASE_VER);

request.onerror = (err) =>
  console.error(`IndexedDB error: ${request.error}`, err);

request.onsuccess = () => {
  database = request.result;
};

request.onupgradeneeded = function () {
  // Perform schema changes or upgrades here
  database = request.result;

  // Create an objectStore for this database
  const objectStore = database.createObjectStore(OBJECT_STORE_NAME, {
    keyPath: "id",
  });

  objectStore.createIndex("name", "name", { unique: false });
};

const setDataOnIDB = <T>(
  objectStoreName: string,
  playload: T
): Promise<DOMException | string | null> => {
  database = request.result;

  const transaction = database.transaction(objectStoreName, "readwrite");

  const todoStore = transaction.objectStore(OBJECT_STORE_NAME);

  todoStore.add(playload);

  return new Promise((resolve, reject) => {
    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.oncomplete = () => {
      resolve("success");
    };
  });
};

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
    await setDataOnIDB(OBJECT_STORE_NAME, {
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
