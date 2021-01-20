import {EventEmitter} from "events";

const database = new Map<string, Map<number, TDocument>>();

export type TDocument = {
    id: number;
    [key: string]: any;
};

type EventName = "add" | "update" | "delete";

const emitters = new Map();

export class TestRepository {
    private readonly increments = new Map<string, number>();
    private readonly dispatcher: EventEmitter;

    constructor(protected readonly dsn: string) {
        this.dispatcher = emitters.get(dsn) ?? new EventEmitter();
        if (!emitters.has(dsn)) {
            emitters.set(dsn, this.dispatcher);
        }
    }

    public get<T extends TDocument>(name: string) {
        if (!database.has(name)) {
            database.set(name, new Map());
        }

        const map = database.get(name)!;
        const increment = () => {
            const next = (this.increments.get(name) || 0) + 1;
            this.increments.set(name, next);
            return next;
        };

        const dispatcher = this.dispatcher;
        return {
            find(filter?: (item: T) => boolean) {
                const res = [...map.values()] as T[];
                if (filter) {
                    return Promise.resolve(res.filter((item) => filter(item)));
                }

                return Promise.resolve(res as T[]);
            },
            findOne(id: number) {
                return Promise.resolve(map.get(id) as T | undefined);
            },
            add(data: Omit<T, "id">) {
                const id = increment();
                map.set(id, {id, ...data});
                dispatcher.emit("add", {...map.get(id)});
                return Promise.resolve(map.get(id)! as T);
            },
            update(id: number, data: Omit<T, "id">) {
                const todo = map.get(id);
                if (todo) {
                    map.set(id, {...todo, ...data});
                    dispatcher.emit("update", {...map.get(id)});
                }

                return Promise.resolve(map.get(id) as T | undefined);
            },
            delete(id: number) {
                if (map.has(id)) {
                    const deleted = map.get(id);
                    dispatcher.emit("delete", {...deleted});
                }

                return Promise.resolve(map.delete(id));
            },
            subscribe<V>(event: EventName, format: (data: T) => V): AsyncIterableIterator<V> {
                // do not use this code in production it's for test only
                const queue: T[] = [];
                const pending: ((data: T | undefined) => void)[] = [];
                const listener = (data: T) => {
                    if (pending.length > 0) {
                        pending.splice(0, pending.length)
                            .forEach((fn) => fn(data));
                        return;
                    }

                    queue.push(data);
                };

                dispatcher.on(event, listener);

                return {
                    [Symbol.asyncIterator]() {
                        return this;
                    },
                    async return() {
                        dispatcher.removeListener(event, listener);
                        pending.splice(0, pending.length)
                            .forEach((fn) => fn(undefined));
                        return {value: undefined, done: true};
                    },
                    async next(): Promise<IteratorResult<V>> {
                        const next = queue.shift();
                        if (next) {
                            return {value: format(next), done: false};
                        }

                        return new Promise((resolve) => pending.push((data) => {
                            if (data) {
                                return resolve({value: format(data), done: false});
                            }

                            resolve({value: undefined, done: true});
                        }));
                    },
                };
            },
        };
    }
}
