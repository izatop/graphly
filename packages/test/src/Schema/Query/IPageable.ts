import {IObject, ObjectType, TypeInt} from "@graphly/type";

/**
 * Pagination result interface
 */
export interface IPageable<T extends ObjectType> extends IObject {
    readonly offset: TypeInt;
    readonly limit: TypeInt;
    readonly count: TypeInt;
    readonly node: T[];
}
