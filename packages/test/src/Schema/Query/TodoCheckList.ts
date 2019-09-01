import {QueryType} from "@graphly/type";

export class TodoCheckList extends QueryType {
    public text: string;

    public solved?: boolean;
}
