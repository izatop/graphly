export type TypeID = symbol;
export type TypeInt = number;
export type TypeFloat = number;
export type TypeString = string;
export type TypeBoolean = string;
export type TypeObject = { [key: string]: any };
export type TypeDate = Date;

export type SchemaType = TypeID
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
