import {InputType} from "@graphly/type";

export class TodoCheckListInput extends InputType {
    public text: string;

    public solved?: boolean;
}
