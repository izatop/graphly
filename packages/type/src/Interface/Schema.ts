import {InputObjectType, ObjectType} from "../Type";
import {IObject} from "./IObject";

export type TypeID = symbol;
export type TypeInt = number;
export type TypeFloat = number;
export type TypeString = string;
export type TypeBoolean = string;
export type TypeObject = { [key: string]: any };
export type TypeDate = Date;

export type OutputType<TObjectType extends ObjectType = ObjectType> = TObjectType
    | IObject
    | TypeID
    | TypeInt
    | TypeFloat
    | TypeString
    | TypeBoolean
    | TypeObject
    | TypeDate
    | string
    | number
    | boolean
    | symbol
    | undefined
    ;

export type InputType<TInputObjectType extends InputObjectType = InputObjectType> = TInputObjectType
    | TypeID
    | TypeInt
    | TypeFloat
    | TypeString
    | TypeBoolean
    | TypeObject
    | TypeDate
    | string
    | number
    | boolean
    | symbol
    | undefined
    ;
