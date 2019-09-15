import { EventEmitter } from "events";

const database = new Map<string, Map<number, Document>>();

type Document = {
    id: number;
    [key: string]: any;
};

type EventName = "add" | "update" | "delete";

export class TestRepository {
    private readonly increments = new Map<string, number>();
    private readonly dispatcher = new EventEmitter();

    public get<T extends Document>(name: string) {
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
                dispatcher.emit("add", map.get(id));
                return Promise.resolve(map.get(id)! as T);
            },
            update(id: number, data: Omit<T, "id">) {
                const todo = map.get(id);
                if (todo) {
                    map.set(id, {...todo, ...data});
                    dispatcher.emit("update", map.get(id));
                }

                return Promise.resolve(map.get(id) as T | undefined);
            },
            delete(id: number) {
                if (map.has(id)) {
                    const deleted = map.get(id);
                    dispatcher.emit("delete", deleted);
                }

                return Promise.resolve(map.delete(id));
            },
            subscribe(event: EventName): AsyncIterator<T> {
                // do not use this code in production it's for test only
                return {
                    return() {
                        dispatcher.removeAllListeners(event);
                        return {value: undefined, done: true} as any;
                    },
                    next(): Promise<IteratorResult<T>> {
                        return new Promise((resolve) => {
                            dispatcher.once(event, (data: T) => {
                                resolve({value: data, done: false});
                            });
                        });
                    },
                };
            },
        };
    }
}
