import {TYPE} from "./const";

export const TypeBase = new Set([
    TYPE.SCHEMA,
    TYPE.CONTEXT,
    TYPE.CONTAINER,
    TYPE.OBJECT,
    TYPE.OBJECT_INTERFACE,
    TYPE.INPUT_OBJECT,
    TYPE.SUBSCRIPTION,
    TYPE.ENUM,
]);

export const TypeService = new Set([
    TYPE.CONTEXT,
    TYPE.CONTAINER,
]);

export const ReturnType = new Set([
    TYPE.PROMISE,
    TYPE.ASYNC_ITERATOR,
    TYPE.T_SUBSCRIPTION,
]);
