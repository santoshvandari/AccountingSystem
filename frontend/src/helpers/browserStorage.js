export class BrowserStorage {
    constructor(storage) {
        this._storage = storage;
    }

    get(key) {
        return this._storage.getItem(key);
    }

    set(key, value) {
        this._storage.setItem(key, value);
    }

    remove(key) {
        this._storage.removeItem(key);
    }

    clear() {
        this._storage.clear();
    }
}

export const localStorage = new BrowserStorage(window.localStorage);
export const setAccessToken = (accessToken) => localStorage.set("ACCESS_TOKEN", accessToken);
export const getAccessToken = () => localStorage.get("ACCESS_TOKEN");
export const clearAccessToken = () => localStorage.remove("ACCESS_TOKEN");
