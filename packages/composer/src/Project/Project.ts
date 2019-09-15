import {XMap} from "@sirian/common";
import {GraphQLSchema} from "graphql";
import {ProjectSerializer} from "../Serialization";
import {TypeMap} from "../Type";
import {TraceEvent} from "../util/TraceEvent";
import {GQLTransform} from "./Transform/GQL/GQLTransform";
import {SchemaTransform} from "./Transform/Schema/SchemaTransform";

export class Project {
    public readonly root: string;

    protected serialize: () => XMap<string, TypeMap>;

    protected readonly traceEvent = TraceEvent.create(this);

    constructor(root: string, serializer: ProjectSerializer) {
        this.root = root;
        this.serialize = () => {
            return serializer.serialize();
        };
    }

    public get types(): XMap<string, TypeMap> {
        return this.serialize();
    }

    public toGraphQL(): string {
        try {
            this.memoize();
            const graphQLTransform = new GQLTransform(this);
            return graphQLTransform.transform();
        } catch (error) {
            throw this.traceEvent.error(error);
        }
    }

    public toSchema(): GraphQLSchema {
        try {
            this.memoize();
            const schemaTransform = new SchemaTransform(this);
            return schemaTransform.transform();
        } catch (error) {
            throw this.traceEvent.error(error);
        }
    }

    protected memoize() {
        const types = this.serialize();
        this.serialize = () => types;
    }
}
