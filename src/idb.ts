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

  constructor(
    databaseName: string,
    databaseVersion: number,
    schema: IDBSchema
  ) {
    this.request = indexedDB.open(databaseName, databaseVersion);

    this.request.addEventListener("onerror", (err) => {
      console.log(`IndexedDB error: ${this.request?.error}`, err);
    });

    this.request.addEventListener("success", () => {
      this.database = this.request.result;
    });

    this.request.addEventListener("upgradeneeded", async () => {
      this.database = this.request.result;

      this.createObjectStore(schema)
        .then((response) => console.log(response))
        .catch((error) => console.error(error));
    });
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

        resolve("success");
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

  getRecords = <T>(objectStoreName: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      const transaction = this.database?.transaction(objectStoreName);

      if (transaction) {
        const objectStore = transaction.objectStore(objectStoreName);

        const getRequest = objectStore.get("444-44-4444");

        getRequest.onerror = () => {
          reject(
            getRequest.error?.message ||
              "Something went wrong while happening the read operation"
          );
        };

        getRequest.onsuccess = () => {
          resolve(getRequest.result);
        };
      }
    });
  };
}
