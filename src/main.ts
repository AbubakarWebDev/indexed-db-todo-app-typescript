import { nanoid } from "nanoid";
import { IDB, IDBSchema } from "./idb";

const todoIdInput = document.querySelector<HTMLInputElement>("#todo-id");
const todoNameInput = document.querySelector<HTMLInputElement>("#todo-name");
const todoImageInput = document.querySelector<HTMLInputElement>("#todo-image");
const submitBtn = document.querySelector<HTMLButtonElement>("#submit-btn");

const validateForm = () => {
  const todoName = todoNameInput?.value;
  const todoImage = todoImageInput?.files && todoImageInput.files[0];

  if (!todoName || !todoImage) {
    alert("Please enter valid data");
    return;
  }

  return {
    todoName,
    todoImage,
    todoId: todoIdInput?.value ?? "",
  };
};

const populateForm = (todoId: string, todoName: string, todoImage: File) => {
  if (todoIdInput && todoNameInput && todoImageInput) {
    todoNameInput.value = todoName;
    todoIdInput.value = todoId;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(todoImage);
    todoImageInput.files = dataTransfer.files;
  }
};

const resetForm = () => {
  if (todoIdInput && todoNameInput && todoImageInput) {
    todoIdInput.value = "";
    todoNameInput.value = "";
    todoImageInput.value = "";
  }
};

const tryCatch = async (handler: () => Promise<void>) => {
  try {
    await handler();
  } catch (error) {
    alert("Something went wrong. please check browser console for the error");
    console.log(error);
  }
};

function addDynamicEventListener<T extends Event>(
  eventType: string,
  selector: string,
  callback: (event: T, element: HTMLElement) => void
): void {
  document.addEventListener(eventType, function (event: Event) {
    const targetElement: HTMLElement | null = (
      event.target as HTMLElement
    ).closest(selector);

    if (targetElement) {
      callback(event as T, targetElement);
    }
  });
}

interface Todo {
  id: string;
  name: string;
  image: File;
}

submitBtn?.addEventListener("click", async function () {
  const validationResult = validateForm();
  if (!validationResult) return;
  const { todoId, todoName, todoImage } = validationResult;

  const action = this.dataset.action;
  const idbAction = action === "update" ? idb.updateRecord : idb.createRecord;

  await tryCatch(async () => {
    await idbAction(OBJECT_STORE_NAME, {
      id: action === "update" ? todoId : nanoid(),
      name: todoName,
      image: todoImage,
    } satisfies Todo);

    alert(`Record successfully ${action === "update" ? "Updated" : "Added"}`);
    resetForm();
    await renderTodos();
  });
});

addDynamicEventListener(
  "click",
  "#update-btn",
  async function (_event, targetElement) {
    const todoId = targetElement.dataset.id;

    await tryCatch(async () => {
      const todo = await idb.getRecords<Todo>(OBJECT_STORE_NAME, todoId);
      populateForm(todo[0].id, todo[0].name, todo[0].image);
      if (submitBtn) submitBtn.dataset.action = "update";
    });
  }
);

addDynamicEventListener(
  "click",
  "#delete-btn",
  async function (_event, targetElement) {
    const todoId = targetElement.dataset.id;

    if (todoId) {
      await tryCatch(async () => {
        await idb.deleteRecord(OBJECT_STORE_NAME, todoId);
        await renderTodos();
      });
    } else {
      alert("todo id is not found");
    }
  }
);

async function renderTodos() {
  await tryCatch(async () => {
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
              data-id="${todo.id}"
              class="bg-blue-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Update
            </button>
          </td>
  
          <td class="whitespace-nowrap px-6 py-4">
            <button
              type="button"
              id="delete-btn"
              data-id="${todo.id}"
              class="bg-red-600 text-neutral-50 px-4 py-2 rounded-lg"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    });

    if (tableBody) {
      tableBody.innerHTML = tableRowsHTML;
    }
  });
}

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

const onInitialize = async () => {
  await renderTodos();
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
