import {assert} from "@sirian/assert";
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

    private readonly sourceRoot: string;

    private readonly targetRoot: string;

    constructor(options: IComposerOptions) {
        this.schemaPath = path.resolve(options.schemaPath);
        this.sourceRoot = path.dirname(this.schemaPath);
        this.targetRoot = this.sourceRoot;

        if (options.tsconfig && /^[a-z0-9._-]+\.json$/i.test(options.tsconfig)) {
            options.tsconfig = this.resolveTSConfigFile(this.sourceRoot, options.tsconfig);
        } else if (!options.tsconfig) {
            options.tsconfig = this.resolveTSConfigFile(this.sourceRoot);
        }

        if (!existsSync(options.tsconfig)) {
            throw new Error(`Cannot resolve tsconfig.json at ${options.tsconfig}`);
        }

        const tsconfigRelativePath = path.dirname(options.tsconfig);
        const tsconfig = require(options.tsconfig);
        const {compilerOptions = {}} = tsconfig;
        if (compilerOptions.outDir && compilerOptions.rootDir) {
            this.targetRoot = path.join(
                tsconfigRelativePath,
                tsconfig.compilerOptions.outDir,
                path.relative(
                    tsconfig.compilerOptions.rootDir,
                    path.relative(
                        tsconfigRelativePath,
                        this.sourceRoot,
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
            exclude: [`!${this.sourceRoot}/**/*`],
        });

        const reflection = this.application.convert([this.schemaPath]);
        if (!reflection) {
            throw new Error(`Cannot convert source to reflection at ${this.schemaPath}`);
        }

        this.project = new Project(
            this.application.serializer.projectToObject(reflection, {}),
            options.verbose,
        );
    }

    public compose() {
        return this.project.serialize(this.schemaPath, this.sourceRoot);
    }

    public save(savePath?: string) {
        const typeMap = this.compose();
        if (!savePath) {
            const basePath = this.targetRoot;
            const baseName = path.basename(this.schemaPath, path.extname(this.schemaPath));
            savePath = path.join(basePath, `${baseName}.json`);
        }

        writeFileSync(savePath, JSON.stringify([...typeMap.values()]));
    }

    protected resolveTSConfigFile(directory: string, name = "tsconfig.json"): string {
        const tsconfig = path.resolve(directory, name);
        if (existsSync(tsconfig)) {
            return tsconfig;
        }

        assert(directory !== "/", "Cannot resolve tsconfig.json");
        return this.resolveTSConfigFile(path.resolve(directory, "../"), name);
    }
}
