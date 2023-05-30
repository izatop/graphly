const diagnostics = new WeakMap<TransformError, any>();

export class TransformError extends Error {
    public kind: string;

    public message: string;

    constructor(kind: string, message: string, diagnostic?: any) {
        super(message);
        this.kind = kind;
        this.message = message;
        if (diagnostic) {
            diagnostics.set(this, diagnostic);
        }
    }

    public get diagnostic(): any {
        return diagnostics.get(this);
    }
}
