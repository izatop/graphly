import {InputObjectType, ObjectType} from "../Type";
import {IObject} from "./IObject";

// TypeID may have one of these types: string/number
// or string-serialization object like ObjectId type.
export type TypeID = any;

export type TypeInt = number;
export type TypeFloat = number;
export type TypeString = string;
export type TypeBoolean = boolean;
export type TypeObject = { [key: string]: any };
export type TypeDate = Date;
export type TypeDomain = string;
export type TypePhone = string;
export type TypeEmail = string;
export type TypeIPv4 = string;

export type OutputType<TObjectType extends ObjectType = ObjectType> = TObjectType
    | IObject
    | TypeID
    | TypeInt
    | TypeFloat
    | TypeString
    | TypeBoolean
    | TypeObject
    | TypeDate
    | TypeDomain
    | TypePhone
    | TypeEmail
    | TypeIPv4
    | string
    | number
    | boolean
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
    | TypeDomain
    | TypePhone
    | TypeEmail
    | TypeIPv4
    | string
    | number
    | boolean
    | undefined
    ;
