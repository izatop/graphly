import {ObjectType} from "@graphly/type";

export class TodoChecklist extends ObjectType {
    public text: string;

    public solved?: boolean;
}
