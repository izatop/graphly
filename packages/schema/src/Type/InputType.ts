import {TYPE} from "./const";
import {ScalarType} from "./ScalarType";

export const InputType = new Set([
    ...ScalarType.values(),
    TYPE.INPUT_OBJECT,
]);
