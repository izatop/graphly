import {existsSync} from "fs";
import {dirname, resolve} from "path";
import {Application} from "typedoc";
import {Project} from "../Project";
import {ProjectSerializer} from "../Serialization";
import {TraceEvent} from "../util/TraceEvent";

export interface IComposerOptions {
    name?: string;
    basePath: string;
    schemaPath: string;
    tsconfig?: string;
    verbose?: boolean;
}

export class Composer {
    private readonly application: Application;

    private readonly project: Project;

    constructor(options: IComposerOptions) {
        if (!options.tsconfig) {
            options.tsconfig = this.resolveTSConfigFile(options.basePath);
        }

        const schemaPath = resolve(options.basePath, options.schemaPath);
        if (!existsSync(schemaPath)) {
            throw new Error(`Cannot resolve schema path at ${schemaPath}`);
        }

        TraceEvent.toggle(options.verbose || false);
        this.application = new Application({
            name: options.name || "GraphQL",
            tsconfig: options.tsconfig,
            exclude: `!${dirname(schemaPath)}/**/*`,
        });

        const reflection = this.application.convert([schemaPath]);
        if (!reflection) {
            console.log({
                name: options.name || "GraphQL",
                tsconfig: options.tsconfig,
                exclude: `!${dirname(schemaPath)}/**/*`,
            });
            throw new Error(`Cannot convert source to reflection at ${schemaPath}`);
        }

        this.project = new Project(dirname(schemaPath), new ProjectSerializer(reflection));
    }

    public compose() {
        return this.project;
    }

    protected resolveTSConfigFile(basePath: string, original?: string): string {
        const tsconfig = resolve(basePath, "tsconfig.json");
        if (existsSync(tsconfig)) {
            return tsconfig;
        }

        if (basePath === "/") {
            throw new Error(`Cannot resolve tsconfig.json from ${original}`);
        }

        return this.resolveTSConfigFile(
            resolve(basePath, "../"),
            original || basePath,
        );
    }
}
