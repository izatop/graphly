import {InputType} from "@graphly/type";

export class TodoChecklistInput extends InputType {
    public text: string;

    public solved?: boolean;
}
