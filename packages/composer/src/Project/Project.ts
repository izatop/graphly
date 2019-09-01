import {IType} from "../Serialization/interfaces";
import {TraceEvent} from "../Serialization/TraceEvent";
import {GQLTransform} from "./Transform/GQL/GQLTransform";

export class Project {
    public readonly types = new Map<string, IType>();

    protected traceEvent = TraceEvent.create(this);

    constructor(types: Map<string, IType>) {
        this.types = types;
    }

    public toGraphQL() {
        try {
            const graphQLTransform = new GQLTransform(this.types);
            return graphQLTransform.transform();
        } catch (error) {
            this.traceEvent.error(error);
        }
    }

    public toSchema() {
        return {};
    }
}
