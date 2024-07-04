import { nanoid } from "nanoid";
import { IDB, IDBSchema } from "./idb";

// Types
interface Todo {
  id: string;
  name: string;
  image: File;
}

// Constants
const DATABASE_NAME = "main";
const DATABASE_SCHEMA_VER = 1;
const OBJECT_STORE_NAME = "todos";

// DOM Elements
const todoIdInput = document.querySelector<HTMLInputElement>("#todo-id");
const todoNameInput = document.querySelector<HTMLInputElement>("#todo-name");
const todoImageInput = document.querySelector<HTMLInputElement>("#todo-image");
const submitBtn = document.querySelector<HTMLButtonElement>("#submit-btn");
const tableBody = document.getElementById(
  "table-body"
) as HTMLTableSectionElement;

// Form Functions
const validateForm = () => {
  const todoName = todoNameInput?.value;
  const todoImage = todoImageInput?.files?.[0];

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

const populateForm = (
  todoId: string,
  todoName: string,
  todoImage: File
): void => {
  if (todoIdInput && todoNameInput && todoImageInput) {
    todoNameInput.value = todoName;
    todoIdInput.value = todoId;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(todoImage);
    todoImageInput.files = dataTransfer.files;
  }
};

const resetForm = (): void => {
  if (todoIdInput && todoNameInput && todoImageInput) {
    todoIdInput.value = "";
    todoNameInput.value = "";
    todoImageInput.value = "";
  }
};

// Utility Functions
const tryCatch = async (handler: () => Promise<void>): Promise<void> => {
  try {
    await handler();
  } catch (error) {
    alert("Something went wrong. Please check browser console for the error");
    console.error(error);
  }
};

const addDynamicEventListener = <T extends Event>(
  eventType: string,
  selector: string,
  callback: (event: T, element: HTMLElement) => void
): void => {
  document.addEventListener(eventType, (event: Event) => {
    const targetElement = (event.target as HTMLElement).closest(selector);

    if (targetElement) {
      callback(event as T, targetElement as HTMLElement);
    }
  });
};

// IDB Setup
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

const idb = new IDB(DATABASE_NAME, DATABASE_SCHEMA_VER, idbSchema, renderTodos);

// CRUD Operations
const createTodo = async (todo: Todo): Promise<void> => {
  await idb.createRecord(OBJECT_STORE_NAME, todo);
};

const updateTodo = async (todo: Todo): Promise<void> => {
  await idb.updateRecord(OBJECT_STORE_NAME, todo);
};

const deleteTodo = async (todoId: string): Promise<void> => {
  await idb.deleteRecord(OBJECT_STORE_NAME, todoId);
};

const getTodo = async (todoId: string): Promise<Todo> => {
  const todos = await idb.getRecords<Todo>(OBJECT_STORE_NAME, todoId);
  return todos[0];
};

const getAllTodos = async (): Promise<Todo[]> => {
  return await idb.getRecords<Todo>(OBJECT_STORE_NAME);
};

// Render Function
async function renderTodos(): Promise<void> {
  await tryCatch(async () => {
    const todos = await getAllTodos();

    const tableRowsHTML = todos
      .map((todo, index) => {
        const objectUrl = URL.createObjectURL(todo.image);
        return `
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
      })
      .join("");

    if (tableBody) {
      tableBody.innerHTML = tableRowsHTML;
    }
  });
}

// Event Handlers
const handleSubmit = async (event: Event): Promise<void> => {
  event.preventDefault();
  const validationResult = validateForm();
  if (!validationResult) return;

  const { todoId, todoName, todoImage } = validationResult;
  const action = submitBtn?.dataset.action;
  const todo: Todo = {
    id: action === "update" ? todoId : nanoid(),
    name: todoName,
    image: todoImage,
  };

  await tryCatch(async () => {
    if (action === "update") {
      await updateTodo(todo);
    } else {
      await createTodo(todo);
    }
    alert(`Record successfully ${action === "update" ? "Updated" : "Added"}`);
    resetForm();
    await renderTodos();
  });
};

const handleUpdate = async (
  _event: Event,
  targetElement: HTMLElement
): Promise<void> => {
  const todoId = targetElement.dataset.id;
  if (!todoId) return;

  await tryCatch(async () => {
    const todo = await getTodo(todoId);
    populateForm(todo.id, todo.name, todo.image);
    if (submitBtn) submitBtn.dataset.action = "update";
  });
};

const handleDelete = async (
  _event: Event,
  targetElement: HTMLElement
): Promise<void> => {
  const todoId = targetElement.dataset.id;
  if (!todoId) {
    alert("Todo ID is not found");
    return;
  }

  await tryCatch(async () => {
    await deleteTodo(todoId);
    await renderTodos();
  });
};

// Event Listeners
submitBtn?.addEventListener("click", handleSubmit);
addDynamicEventListener("click", "#update-btn", handleUpdate);
addDynamicEventListener("click", "#delete-btn", handleDelete);

// Initialize
if (!window.indexedDB) {
  alert("Indexed DB is not supported");
}
