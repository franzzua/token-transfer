import {EventEmitter, Fn} from "@cmmn/cell/lib";
import { IndexedDatabase } from "./indexedDatabase";

export class ObservableDB<T extends { _id: string }> extends EventEmitter<{
  loaded: void;
  change:
    | { type: "init"; value: T[] }
    | ((
        | { type: "addOrUpdate"; key: string | number; value: T }
        | { type: "delete"; key: string | number }
      ) & { fromReplication?: boolean });
}> {
  private db = new IndexedDatabase(this.name);

  protected items = new Map<string, T & { version: string }>();
  private channel = new BroadcastChannel(this.name);

  public isLoaded: Promise<void> = this.onceAsync("loaded");
  constructor(public name: string) {
    super();
    globalThis[name] = this;
    this.init();
    this.channel.addEventListener('message', async e => {
      if (e.data?.key != 'change') return;
      switch (e.data.event?.type){
        case "addOrUpdate":
          await this.addOrUpdate(e.data.event.value, true);
          super.emit("change", e.data.event);
          break;
        case "delete":
          await this.remove(e.data.event.key, true);
          super.emit("change", e.data.event);
          break;
      }
    })
  }
  public emit(key, event?){
    super.emit(key, event);
    this.channel.postMessage({
      key, event
    });
  }

  private async init() {
    await this.loadItems().then((x) => {
      this.emit("loaded");
      this.emit("change");
    });
  }

  async remove(key: string, skipChange = false) {
    const existed = this.get(key);
    if (!existed) return;
    this.db.remove(key);
    this.items.delete(key);
    if (!skipChange) {
      this.emit("change", {
        type: "delete",
        key: key,
      });
    }
  }

  async clear() {
    await this.db.purge();
    this.items.clear();
    this.emit("change", {
      type: "delete",
      key: undefined,
    });
  }

  async set(value: T & { version: string }) {
    await this.db.set(value._id, value);
    this.items.set(value._id, value);
  }

  async addOrUpdate(value: T, skipChange = false) {
    await this.isLoaded;
    const valueWithVersion = {
      ...value,
      version: Fn.ulid(),
    };
    await this.set(valueWithVersion);
    if (!skipChange) {
      this.emit("change", {
        type: "addOrUpdate",
        key: value._id,
        value,
      });
    }
  }

  get(id: string): T {
    return this.items.get(id);
  }

  toArray(): T[] {
    return Array.from(this.items.values()).filter(x => !x['deleted']);
  }

  entries() {
    return this.items.entries();
  }

  keys() {
    return this.items.keys();
  }

  values() {
    return this.items.values();
  }

  async loadItems() {
    const keys = await this.db.keys();

    this.items = new Map();
    for (let key of keys) {
      this.items.set(key as string, await this.db.get(key as string));
    }
    this.emit("change", {
      type: "init",
      value: Array.from(this.values()),
    });
  }



}

