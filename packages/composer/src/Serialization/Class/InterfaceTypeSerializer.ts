import {IType} from "../interfaces";
import {ObjectTypeSerializer} from "./ObjectTypeSerializer";

export class InterfaceTypeSerializer extends ObjectTypeSerializer {
    public serialize(): IType {
        return {...super.serialize(), abstract: true};
    }
}
