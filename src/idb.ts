export interface IDBIndex {
  name: string;
  keyPath: string | Iterable<string>;
  options?: IDBIndexParameters;
}

export interface IDBSchema {
  objectStoreName: string;
  objectStoreOptions?: IDBObjectStoreParameters;
  objectStoreIndexes?: IDBIndex[];
}

export class IDB {
  private database?: IDBDatabase;
  private readonly request: IDBOpenDBRequest;
  private isVersionChanged = false;

  constructor(
    databaseName: string,
    databaseVersion: number,
    schema: IDBSchema,
    onInitialize?: () => void
  ) {
    this.request = indexedDB.open(databaseName, databaseVersion);
    this.setupEventListeners(schema, onInitialize);
  }

  private setupEventListeners(
    schema: IDBSchema,
    onInitialize?: () => void
  ): void {
    this.request.addEventListener("error", this.onRequestError);
    this.request.addEventListener("success", () =>
      this.onRequestSuccess(onInitialize)
    );
    this.request.addEventListener("upgradeneeded", () =>
      this.onUpgradeneeded(schema, onInitialize)
    );
  }

  private onRequestError = (event: Event): void => {
    console.error(`IndexedDB error: ${this.request?.error}`, event);
  };

  private onRequestSuccess = (onInitialize?: () => void): void => {
    this.database = this.request.result;
    if (!this.isVersionChanged) {
      onInitialize?.();
    }
    this.isVersionChanged = false;
  };

  private onUpgradeneeded = (
    schema: IDBSchema,
    onInitialize?: () => void
  ): void => {
    this.database = this.request.result;
    this.createObjectStore(schema)
      .then(() => {
        onInitialize?.();
        this.isVersionChanged = true;
      })
      .catch((error) => alert(error));
  };

  createObjectStore({
    objectStoreName,
    objectStoreOptions,
    objectStoreIndexes,
  }: IDBSchema): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (this.database?.objectStoreNames.contains(objectStoreName)) {
          reject(
            new Error(
              "The passed objectStoreName already exists in the database"
            )
          );
          return;
        }

        const objectStore = this.database?.createObjectStore(
          objectStoreName,
          objectStoreOptions
        );

        if (!objectStore) {
          reject(new Error("Failed to create object store"));
          return;
        }

        objectStoreIndexes?.forEach(({ name, keyPath, options }) => {
          objectStore.createIndex(name, keyPath, options);
        });

        objectStore.transaction.oncomplete = () => resolve("success");
      } catch (error) {
        reject(
          error instanceof DOMException
            ? error.message
            : "An error occurred while creating the object store"
        );
      }
    });
  }

  createRecord<T>(
    objectStoreName: string,
    payload: T,
    key?: IDBValidKey
  ): Promise<string> {
    return this.performTransaction(
      objectStoreName,
      "readwrite",
      (objectStore) => {
        objectStore.add(payload, key);
      },
      "write"
    );
  }

  updateRecord<T>(
    objectStoreName: string,
    payload: T,
    key?: IDBValidKey
  ): Promise<string> {
    return this.performTransaction(
      objectStoreName,
      "readwrite",
      (objectStore) => {
        objectStore.put(payload, key);
      },
      "update"
    );
  }

  getRecords<T>(objectStoreName: string, key?: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.database?.transaction(objectStoreName);
      if (!transaction) {
        reject(new Error("Failed to create transaction"));
        return;
      }

      const objectStore = transaction.objectStore(objectStoreName);
      const request = key ? objectStore.get(key) : objectStore.getAll();

      request.onerror = () =>
        reject(new Error(request.error?.message || "Failed to read records"));
      request.onsuccess = () =>
        resolve(
          Array.isArray(request.result) ? request.result : [request.result]
        );
    });
  }

  deleteRecord(
    objectStoreName: string,
    key: IDBValidKey | IDBKeyRange
  ): Promise<string> {
    return this.performTransaction(
      objectStoreName,
      "readwrite",
      (objectStore) => {
        objectStore.delete(key);
      },
      "delete"
    );
  }

  private performTransaction(
    objectStoreName: string,
    mode: IDBTransactionMode,
    operation: (objectStore: IDBObjectStore) => void,
    operationType: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.database?.transaction(objectStoreName, mode);
      if (!transaction) {
        reject(
          new Error(
            `Failed to create transaction for ${operationType} operation`
          )
        );
        return;
      }

      const objectStore = transaction.objectStore(objectStoreName);
      operation(objectStore);

      transaction.onerror = () =>
        reject(
          new Error(
            transaction.error?.message ||
              `Failed to perform ${operationType} operation`
          )
        );
      transaction.oncomplete = () => resolve("success");
    });
  }
}
