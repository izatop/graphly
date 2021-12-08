import {XMap} from "@sirian/common";
import {memoize} from "@sirian/decorators";
import {GraphQLSchema} from "graphql";
import * as path from "path";
import {TypeMap} from "../Type";
import {GQLTransform} from "./Transform/GQL/GQLTransform";
import {SchemaTransform} from "./Transform/Schema/SchemaTransform";

export class Project {
    public readonly root: string;

    public readonly types: XMap<string, TypeMap>;

    constructor(root: string, types: TypeMap[]) {
        this.root = root;
        this.types = new XMap();
        for (const type of types) {
            this.types.set(type.name, type);
        }
    }

    public static from(file: string) {
        const basePath = path.dirname(file);
        const baseName = path.basename(file, path.extname(file));
        const typeMapPath = path.resolve(basePath, `${baseName}.json`);

        // eslint-disable-next-line
        return new this(basePath, require(typeMapPath));
    }

    @memoize()
    public toGraphQL(): string {
        try {
            const graphQLTransform = new GQLTransform(this);
            return graphQLTransform.transform();
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);

            throw error;
        }
    }

    @memoize()
    public toSchema(): GraphQLSchema {
        try {
            const schemaTransform = new SchemaTransform(this);
            return schemaTransform.transform();
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);

            throw error;
        }
    }
}
