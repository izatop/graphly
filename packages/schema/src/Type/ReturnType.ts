import {TYPE} from "./const";

export const ReturnType = new Set([
    TYPE.PROMISE,
    TYPE.ASYNC_ITERATOR,
    TYPE.T_SUBSCRIPTION,
    TYPE.RETURNS,
    TYPE.RETURNS_NULLABLE,
]);

export const NullableType = new Set([TYPE.RETURNS_NULLABLE]);
