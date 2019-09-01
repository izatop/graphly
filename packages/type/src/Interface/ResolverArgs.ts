import {InputType} from "../Type";
import {Lookup} from "./Lookup";
import {SchemaType} from "./SchemaType";

export type ResolverArgs = SchemaType | InputType | Lookup<any>;
