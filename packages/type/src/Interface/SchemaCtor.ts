import {Schema} from "../Schema";

export type SchemaCtor<T extends Schema = Schema> = new() => T;
