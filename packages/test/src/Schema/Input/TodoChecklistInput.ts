import {InputObjectType} from "@graphly/type";

export class TodoChecklistInput extends InputObjectType {
    public readonly text: string;

    public readonly solved?: boolean;
}
