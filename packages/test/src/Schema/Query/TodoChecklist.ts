import {QueryType} from "@graphly/type";

export class TodoChecklist extends QueryType {
    public text: string;

    public solved?: boolean;
}
