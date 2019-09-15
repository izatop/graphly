import {ObjectType, SubscriptionType} from "../Type";

export type SchemaCtor<T extends Schema = Schema> = {
    new(): T;
    getSchemaLocation(): NodeModule | string;
};

export abstract class Schema {
    public abstract readonly query: ObjectType;

    public readonly mutation?: ObjectType;

    public readonly subscription?: SubscriptionType;
}
