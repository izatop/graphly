import {ProjectSerializer} from "./ProjectSerializer";
import {SerializeError} from "./SerializeError";

export abstract class SerializerAbstract<R, S> {
    public readonly project: ProjectSerializer;

    public readonly data: S;

    public constructor(project: ProjectSerializer, data: S) {
        this.project = project;
        this.data = data;
    }

    public abstract get name(): string;

    public abstract serialize(): R;

    public assert(expr: any, message: string, diagnostic?: () => object | object[]) {
        if (!expr) {
            throw new SerializeError(
                this.constructor.name,
                this.name,
                message,
                diagnostic && diagnostic(),
            );
        }
    }

    protected inspect(type: any) {
        return require("util").inspect(type, false, Infinity);
    }
}
