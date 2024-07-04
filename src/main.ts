import { nanoid } from "nanoid";
import { IDB, IDBSchema } from "./idb";

// ====================================================
//     Indexed DB Implementation Starts From Here
// ====================================================

if (!window.indexedDB) {
  alert("Indexed DB is not supported");
}

const DATABASE_NAME = "main";
const DATABASE_SCHEMA_VER = 1;
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

const onInitialize = () => {
  renderTodos();
};

const idb = new IDB(
  DATABASE_NAME,
  DATABASE_SCHEMA_VER,
  idbSchema,
  onInitialize
);

// ====================================================
//        Indexed DB Implementation End Here
// ====================================================

interface Todo {
  id: string;
  name: string;
  image: File;
}

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
    } satisfies Todo);

    alert("Record successfully added");

    todoNameInput.value = "";
    todoImageInput.value = "";

    await renderTodos();
  } catch (error) {
    alert("Something went wrong. please check browser console for the error");
    console.log(error);
  }
});

document.getElementById("update-btn")?.addEventListener("click", () => {});
document.getElementById("delete-btn")?.addEventListener("click", () => {});

async function renderTodos() {
  try {
    const todos = await idb.getRecords<Todo>(OBJECT_STORE_NAME);
    const tableBody = document.getElementById("table-body");
    let tableRowsHTML = "";

    todos.forEach((todo, index) => {
      const objectUrl = URL.createObjectURL(todo.image);

      tableRowsHTML += `
        <tr class="border-b dark:border-neutral-500">
          <td class="whitespace-nowrap px-6 py-4 font-medium">${index + 1}</td>
  
          <td class="whitespace-nowrap px-6 py-4">${todo.name}</td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <img src="${objectUrl}" alt="Todo Attachment" width="100" height="100" />
          </td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <button
              type="button"
              id="update-btn"
              class="bg-blue-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Update
            </button>
          </td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <button
              type="button"
              id="delete-btn"
              class="bg-red-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </td>
        </tr>
      `;

      if (tableBody) tableBody.innerHTML = tableRowsHTML;
    });
  } catch (error) {
    alert("Something went wrong. please check browser console for the error");
    console.log(error);
  }
}
