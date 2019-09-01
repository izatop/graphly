import {InterfaceType, QueryType, TypeInt} from "@graphly/type";

/**
 * Pagination Result interface
 */
export interface IPageable<T extends QueryType> extends InterfaceType {
    readonly offset: TypeInt;
    readonly limit: TypeInt;
    readonly count: TypeInt;
    readonly node: T[];
}
