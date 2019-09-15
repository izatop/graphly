import {existsSync, writeFileSync} from "fs";
import * as path from "path";
import {Application} from "typedoc";
import {ProjectSerializer} from "../Serialization";
import {TraceEvent} from "../util/TraceEvent";

export interface IComposerOptions {
    name?: string;
    schemaPath: string;
    tsconfig?: string;
    verbose?: boolean;
}

export class Composer {
    private readonly application: Application;

    private readonly project: ProjectSerializer;

    private readonly schemaPath: string;

    private readonly basePath: string;

    private readonly targetBasePath: string;

    constructor(options: IComposerOptions) {
        this.schemaPath = path.resolve(options.schemaPath);
        this.basePath = path.dirname(this.schemaPath);

        if (!options.tsconfig) {
            options.tsconfig = this.resolveTSConfigFile(this.basePath);
        }

        if (!existsSync(options.tsconfig)) {
            throw new Error(`Cannot resolve tsconfig.json at ${options.tsconfig}`);
        }

        const tsconfigRelativePath = path.dirname(options.tsconfig);
        const tsconfig = require(options.tsconfig);
        this.targetBasePath = this.basePath;
        if (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir && tsconfig.compilerOptions.rootDir) {
            this.targetBasePath = path.join(
                tsconfigRelativePath,
                tsconfig.compilerOptions.outDir,
                path.relative(
                    tsconfig.compilerOptions.rootDir,
                    path.relative(
                        tsconfigRelativePath,
                        this.basePath,
                    ),
                ),
            );
        }

        if (!existsSync(this.schemaPath)) {
            throw new Error(`Cannot resolve schema path at ${this.schemaPath}`);
        }

        TraceEvent.toggle(options.verbose || false);
        this.application = new Application({
            name: options.name || "GraphQL",
            tsconfig: options.tsconfig,
            exclude: `!${this.basePath}/**/*`,
        });

        const reflection = this.application.convert([this.schemaPath]);
        if (!reflection) {
            throw new Error(`Cannot convert source to reflection at ${this.schemaPath}`);
        }

        this.project = new ProjectSerializer(reflection);
    }

    public compose() {
        return this.project.serialize();
    }

    public save(savePath?: string) {
        const typeMap = this.compose();
        if (!savePath) {
            const basePath = this.targetBasePath;
            const baseName = path.basename(this.schemaPath, path.extname(this.schemaPath));
            savePath = path.join(basePath, `${baseName}.json`);
        }

        writeFileSync(savePath, JSON.stringify([...typeMap.values()]));
    }

    protected resolveTSConfigFile(basePath: string, original?: string): string {
        const tsconfig = path.resolve(basePath, "tsconfig.json");
        if (existsSync(tsconfig)) {
            return tsconfig;
        }

        if (basePath === "/") {
            throw new Error(`Cannot resolve tsconfig.json from ${original}`);
        }

        return this.resolveTSConfigFile(
            path.resolve(basePath, "../"),
            original || basePath,
        );
    }
}
