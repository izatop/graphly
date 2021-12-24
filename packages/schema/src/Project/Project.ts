import {XMap} from "@sirian/common";
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

    public static from(file: string): Project {
        const basePath = path.dirname(file);
        const baseName = path.basename(file, path.extname(file));
        const typeMapPath = path.resolve(basePath, `${baseName}.json`);

        return new this(basePath, this.loadJSON(typeMapPath));
    }

    public static loadJSON(path: string): any {
        delete require.cache[path];

        return require(path);
    }

    public toGraphQL(): string {
        try {
            return new GQLTransform(this)
                .transform();
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);

            throw error;
        }
    }

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
