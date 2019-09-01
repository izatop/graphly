const diagnostics = new WeakMap<SerializeError, any>();

export class SerializeError extends Error {
    public kind: string;

    public name: string;

    public message: string;

    constructor(kind: string, name: string, message: string, diagnostic?: object | object[]) {
        super(message);
        this.kind = kind;
        this.name = name;
        this.message = message;
        if (diagnostic) {
            diagnostics.set(this, diagnostic);
        }
    }

    public get diagnostic() {
        return diagnostics.get(this);
    }
}
