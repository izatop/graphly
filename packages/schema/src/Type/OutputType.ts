import {TYPE} from "./const";
import {ScalarType} from "./ScalarType";

export const OutputType = new Set([
    ...ScalarType.values(),
    TYPE.SUBSCRIPTION,
    TYPE.OBJECT,
    TYPE.OBJECT_INTERFACE,
]);
