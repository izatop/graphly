import {assert} from "@sirian/assert";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import * as path from "path";
import * as TypeDoc from "typedoc";
import {Project} from "../Project";

export interface IComposerOptions {
    name?: string;
    schemaPath: string;
    tsconfig?: string;
    verbose?: boolean;
    exclusive?: boolean;
    extra?: string[];
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
        const rootDir = compilerOptions.rootDir ?? compilerOptions.rootDirs?.[0] ?? "src";
        if (compilerOptions.outDir && rootDir) {
            this.targetRoot = path.join(
                tsconfigRelativePath,
                tsconfig.compilerOptions.outDir,
                path.relative(
                    rootDir,
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

        const extra: { exclude?: string[] } = {};
        if (options.exclusive) {
            extra.exclude = [`!${this.sourceRoot}/**/*`];
        }

        this.application = new TypeDoc.Application();
        this.application.options.addReader(new TypeDoc.TSConfigReader());
        this.application.options.addReader(new TypeDoc.TypeDocReader());
        this.application.bootstrap({
            name: options.name || "GraphQL",
            tsconfig: options.tsconfig,
            ...extra,
        });

        const extraTypesFile = this.resolveExtraTypesPaths(options.extra);
        const reflection = this.application.convert([this.schemaPath, ...extraTypesFile]);
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
        if (!savePath) {
            const basePath = this.targetRoot;
            const baseName = path.basename(this.schemaPath, path.extname(this.schemaPath));
            savePath = path.join(basePath, `${baseName}.json`);
        }

        const outDir = path.dirname(savePath);
        if (!existsSync(outDir)) {
            mkdirSync(outDir, {recursive: true});
        }

        writeFileSync(savePath, JSON.stringify([...this.compose().values()]));
        process.stdout.write(`Schema written to ${savePath}\n`);

        return savePath;
    }

    protected resolveTSConfigFile(directory: string, name = "tsconfig.json"): string {
        const tsconfig = path.resolve(directory, name);
        if (existsSync(tsconfig)) {
            return tsconfig;
        }

        assert(directory !== "/", "Cannot resolve tsconfig.json");
        return this.resolveTSConfigFile(path.resolve(directory, "../"), name);
    }

    protected resolveExtraTypesPaths(paths?: string[]) {
        if (!paths) {
            return [];
        }

        const resolvedPaths = paths.map((p) => path.resolve(p, "index.ts"));
        assert(resolvedPaths.every((p) => existsSync(p)), `Wrong paths ${resolvedPaths.join(", ")}`);
        return resolvedPaths;
    }
}
