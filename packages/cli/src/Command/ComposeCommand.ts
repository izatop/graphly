import {Project} from "@graphly/schema";
import {Argument, Command, CommandDefinition, FlagOption, Option} from "@sirian/console";
import {debounce} from "@sirian/decorators";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import watch from "node-watch";
import * as path from "path";
import {Composer} from "../Composer";
import {format} from "util";

export class ComposeCommand extends Command {
    protected get verbose(): boolean {
        return this.getOption("verbose");
    }

    public static configure(def: CommandDefinition): void {
        def
            .addArguments([new Argument({name: "file", multiple: true, required: true})])
            .addOptions([
                new Option({name: "base"}),
                new Option({name: "config"}),
                new Option({name: "types-dir"}),
                new FlagOption({name: "watch", shortcut: "w"}),
                new FlagOption({name: "exclusive", shortcut: "e"}),
                new Option({name: "extra", shortcut: "x", multiple: true}),
            ])
            .setDescription("GraphQL Server");

        process.on("SIGINT", () => process.exit());
    }

    public async execute(): Promise<void> {
        const files: string[] = this.getArgument("file");
        const watchFlag: boolean = this.getOption("watch");
        const typesDir: string = this.getOption("types-dir") ?? "";
        const base = this.getOption("base");
        const paths = base ? files.map((file) => path.resolve(base, file)) : files;
        this.compose(paths, typesDir);

        if (watchFlag) {
            const watchOptions = {recursive: true, filter: /^.+\.(ts|js)$/};
            const watchDirectory = [...new Set(paths.map((file) => path.dirname(file))).values()];
            this.log("Schema watching:", watchDirectory);
            watch(watchDirectory, watchOptions, (e, file) => {
                if (!file) {
                    return;
                }

                this.info("watch(event=%s, file=%s)", e, file);
                const directory = watchDirectory.find((d) => file.startsWith(d));
                if (directory) {
                    const schemaFiles = paths.filter((schema) => schema.startsWith(directory));
                    if (schemaFiles.length > 0) {
                        this.compose(schemaFiles, typesDir);
                    }
                }
            });
        }
    }

    public log(...msg: any): void {
        if (this.verbose) {
            // eslint-disable-next-line
            console.log(...msg);
        }
    }

    public info(...msg: any): void {
        // eslint-disable-next-line
        console.info(format(...msg));
    }

    @debounce(1000)
    protected compose(files: string[], typesDir?: string): void {
        try {
            const tsconfig: string = this.getOption("config");
            for (const schemaPath of files) {
                const name = path.basename(schemaPath);
                const composer = new Composer({
                    name,
                    tsconfig,
                    schemaPath,
                    verbose: this.verbose,
                    exclusive: this.getOption("exclusive"),
                    extra: this.getOption("extra"),
                });

                const schemaFile = composer.save();
                this.info("compose(%s): %s", name, path.basename(schemaFile));

                if (typesDir) {
                    const typesPath = path.resolve(typesDir);
                    const graphqlSchemaFile = `${path.basename(schemaFile, ".json")}.graphql`;
                    const project = Project.from(schemaFile);
                    if (!existsSync(typesPath)) {
                        mkdirSync(typesPath, {recursive: true});
                    }

                    writeFileSync(path.join(typesPath, graphqlSchemaFile), project.toGraphQL());

                    this.info(format("compose(%s): %s", name, graphqlSchemaFile));
                }

                this.info("compose(%s): done", name);
            }
        } catch (error) {
            this.log(error);
        }
    }
}
