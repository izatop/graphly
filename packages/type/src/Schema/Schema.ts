import {MutationType, QueryType} from "../Type";

export abstract class Schema {
    public abstract readonly query: QueryType;

    public abstract readonly mutation?: MutationType;

    public abstract readonly subscription?: MutationType;
}
