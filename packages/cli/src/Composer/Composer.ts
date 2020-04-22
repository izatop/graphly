import {existsSync, writeFileSync} from "fs";
import * as path from "path";
import * as TypeDoc from "typedoc";
import {Project} from "../Project";

export interface IComposerOptions {
    name?: string;
    schemaPath: string;
    tsconfig?: string;
    verbose?: boolean;
}

export class Composer {
    private readonly application: TypeDoc.Application;

    private readonly project: Project;

    private readonly schemaPath: string;

    private readonly basePath: string;

    private readonly targetBasePath: string;

    constructor(options: IComposerOptions) {
        this.schemaPath = path.resolve(options.schemaPath);
        this.basePath = path.dirname(this.schemaPath);
        this.targetBasePath = this.basePath;

        if (!options.tsconfig) {
            options.tsconfig = this.resolveTSConfigFile(this.basePath);
        }

        if (!existsSync(options.tsconfig)) {
            throw new Error(`Cannot resolve tsconfig.json at ${options.tsconfig}`);
        }

        const tsconfigRelativePath = path.dirname(options.tsconfig);
        const tsconfig = require(options.tsconfig);
        const {compilerOptions = {}} = tsconfig;
        if (compilerOptions.outDir && compilerOptions.rootDir) {
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

        this.application = new TypeDoc.Application();
        this.application.options.addReader(new TypeDoc.TSConfigReader());
        this.application.options.addReader(new TypeDoc.TypeDocReader());

        this.application.bootstrap({
            name: options.name || "GraphQL",
            tsconfig: options.tsconfig,
            exclude: [`!${this.basePath}/**/*`],
        });

        const reflection = this.application.convert([this.schemaPath]);
        if (!reflection) {
            throw new Error(`Cannot convert source to reflection at ${this.schemaPath}`);
        }

        this.project = new Project(
            path.relative(path.resolve(options.tsconfig, "../../"), this.targetBasePath),
            this.application.serializer.projectToObject(reflection, {}),
        );
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
