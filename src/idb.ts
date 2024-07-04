export interface IDBIndex {
  name: string;
  options?: IDBIndexParameters;
  keyPath: string | Iterable<string>;
}

export interface IDBSchema {
  objectStoreName: string;
  objectStoreOptions?: IDBObjectStoreParameters;
  objectStoreIndexes?: IDBIndex[];
}

export class IDB {
  private database?: IDBDatabase;
  private request: IDBOpenDBRequest;
  private isVersionChanged?: boolean;

  constructor(
    databaseName: string,
    databaseVersion: number,
    schema: IDBSchema,
    onInitialize?: () => void
  ) {
    this.request = indexedDB.open(databaseName, databaseVersion);

    this.request.addEventListener("onerror", this.onRequestError);

    this.request.addEventListener("success", () =>
      this.onRequestSuccess(onInitialize)
    );

    this.request.addEventListener("upgradeneeded", () =>
      this.onUpgradeneeded(schema, onInitialize)
    );
  }

  createObjectStore({
    objectStoreName,
    objectStoreOptions,
    objectStoreIndexes,
  }: IDBSchema) {
    return new Promise((resolve, reject) => {
      try {
        if (this.database?.objectStoreNames.contains(objectStoreName)) {
          reject("The passed objectStoreName is already exist on the database");
          return;
        }

        const objectStore = this.database?.createObjectStore(
          objectStoreName,
          objectStoreOptions
        );

        if (!objectStore) {
          reject("Something went wrong. Please try again later");
          return;
        }

        if (objectStoreIndexes) {
          objectStoreIndexes.forEach(({ name, keyPath, options }) => {
            objectStore.createIndex(name, keyPath, options);
          });
        }

        objectStore.transaction.oncomplete = () => resolve("success");
      } catch (error) {
        reject(
          (error instanceof DOMException && error?.message) ||
            "Something went wrong. Please try again later"
        );
      }
    });
  }

  createRecord = <T>(
    objectStoreName: string,
    playload: T,
    key?: IDBValidKey
  ) => {
    return new Promise((resolve, reject) => {
      const transaction = this.database?.transaction(
        objectStoreName,
        "readwrite"
      );

      if (transaction) {
        const objectStore = transaction.objectStore(objectStoreName);

        objectStore.add(playload, key);

        transaction.onerror = () => {
          reject(
            transaction.error?.message ??
              "Something went wrong while happening the write operation"
          );
        };

        transaction.oncomplete = () => {
          resolve("success");
        };
      }
    });
  };

  updateRecord = <T>(
    objectStoreName: string,
    playload: T,
    key?: IDBValidKey
  ) => {
    return new Promise((resolve, reject) => {
      const transaction = this.database?.transaction(
        objectStoreName,
        "readwrite"
      );

      if (transaction) {
        const objectStore = transaction.objectStore(objectStoreName);

        objectStore.put(playload, key);

        transaction.onerror = () => {
          reject(
            transaction.error?.message ??
              "Something went wrong while happening the update operation"
          );
        };

        transaction.oncomplete = () => {
          resolve("success");
        };
      }
    });
  };

  getRecords = <T>(objectStoreName: string, key?: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const transaction = this.database?.transaction(objectStoreName);

      if (!transaction) {
        reject("Something went wrong with transaction");
        return;
      }

      const objectStore = transaction.objectStore(objectStoreName);

      let getRequest: IDBRequest<any> | IDBRequest<any[]>;

      if (key) {
        getRequest = objectStore.get(key);
      } else {
        getRequest = objectStore.getAll();
      }

      getRequest.onerror = () => {
        reject(
          getRequest.error?.message ||
            "Something went wrong while happening the read operation"
        );
      };

      getRequest.onsuccess = () => {
        resolve(
          Array.isArray(getRequest.result)
            ? getRequest.result
            : [getRequest.result]
        );
      };
    });
  };

  deleteRecord = (objectStoreName: string, key: IDBValidKey | IDBKeyRange) => {
    return new Promise((resolve, reject) => {
      const transaction = this.database?.transaction(
        objectStoreName,
        "readwrite"
      );

      if (transaction) {
        const objectStore = transaction.objectStore(objectStoreName);

        objectStore.delete(key);

        transaction.onerror = () => {
          reject(
            transaction.error?.message ??
              "Something went wrong while happening the delete operation"
          );
        };

        transaction.oncomplete = () => {
          resolve("success");
        };
      }
    });
  };

  onUpgradeneeded = (schema: IDBSchema, onInitialize?: () => void) => {
    this.database = this.request.result;

    this.createObjectStore(schema)
      .then(() => {
        onInitialize?.();
        this.isVersionChanged = true;
      })
      .catch((error) => alert(error));
  };

  onRequestSuccess = (onInitialize?: () => void) => {
    this.database = this.request.result;

    if (!this.isVersionChanged) {
      onInitialize?.();
    }

    this.isVersionChanged = false;
  };

  onRequestError = (err: Event) => {
    console.log(`IndexedDB error: ${this.request?.error}`, err);
  };
}
