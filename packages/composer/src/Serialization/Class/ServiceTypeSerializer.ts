import {IType} from "../interfaces";
import {ObjectTypeSerializer} from "./ObjectTypeSerializer";

export class ServiceTypeSerializer extends ObjectTypeSerializer {
    public serialize(): IType {
        return {
            property: [],
            name: this.name,
            base: this.base,
            file: this.file,
            reference: this.getReference().name,
        };
    }
}
