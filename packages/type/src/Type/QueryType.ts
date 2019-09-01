import {TypeAbstract} from "./TypeAbstract";

export abstract class QueryType<P extends QueryType<any> = any> extends TypeAbstract<P> {
}
