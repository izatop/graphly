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

    public get<T extends TDocument>(name: string): TestCollection<T> {
        const map = database.get(name) ?? new Map();
        if (!database.has(name)) {
            database.set(name, map);
        }

        const increment = (): number => {
            const next = (this.increments.get(name) || 0) + 1;
            this.increments.set(name, next);

            return next;
        };

        const dispatcher = this.dispatcher;

        return new TestCollection<T>(map, increment, dispatcher);
    }
}


export class TestCollection<T extends TDocument> {
    readonly #map: Map<number, T>;
    readonly #dispatcher: EventEmitter;
    readonly #increment: () => number;

    constructor(map: Map<number, T>, increment: () => number, dispatcher: EventEmitter) {
        this.#map = map;
        this.#increment = increment;
        this.#dispatcher = dispatcher;
    }

    find(filter?: (item: T) => boolean): Promise<T[]> {
        const res = [...this.#map.values()] as T[];
        if (filter) {
            return Promise.resolve(res.filter((item) => filter(item)));
        }

        return Promise.resolve(res as T[]);
    }

    findOne(id: number): Promise<T | undefined> {
        return Promise.resolve(this.#map.get(id) as T | undefined);
    }

    add(data: Omit<T, "id">): Promise<T> {
        const id = this.#increment();
        const addTodo: T = {id, createdAt: new Date(), ...data} as TDocument as T;
        this.#map.set(id, addTodo);
        this.#dispatcher.emit("add", {...addTodo});

        return Promise.resolve(addTodo);
    }

    update(id: number, data: Omit<T, "id">): Promise<T | undefined> {
        const todo = this.#map.get(id);

        if (todo) {
            const nextTodo = {...todo, ...data};
            this.#map.set(id, nextTodo);
            this.#dispatcher.emit("update", {...nextTodo});

            return Promise.resolve(nextTodo);
        }

        return Promise.resolve(undefined);
    }

    delete(id: number): Promise<boolean> {
        if (this.#map.has(id)) {
            const deleted = this.#map.get(id);
            this.#dispatcher.emit("delete", {...deleted});
        }

        return Promise.resolve(this.#map.delete(id));
    }

    subscribe(event: EventName): AsyncIterableIterator<T> {
        const queue: T[] = [];
        const pending: ((data: T | undefined) => void)[] = [];
        const listener = (data: T): void => {
            if (pending.length > 0) {
                pending.splice(0, pending.length)
                    .forEach((fn) => fn(data));

                return;
            }

            queue.push(data);
        };

        this.#dispatcher.on(event, listener);
        const dispatcher = this.#dispatcher;

        return {
            [Symbol.asyncIterator](): AsyncIterableIterator<T> {
                return this;
            },
            async return(): Promise<IteratorResult<T, undefined>> {
                dispatcher.removeListener(event, listener);
                pending.splice(0, pending.length)
                    .forEach((fn) => fn(undefined));

                return {value: undefined, done: true};
            },
            async next(): Promise<IteratorResult<T>> {
                const next = queue.shift();
                if (next) {
                    return {value: next, done: false};
                }

                return new Promise((resolve) => pending.push((data) => {
                    if (data) {
                        return resolve({value: data, done: false});
                    }

                    resolve({value: undefined, done: true});
                }));
            },
        };
    }
}
