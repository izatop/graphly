import {Project} from "@graphly/schema";
import {Argument, Command, CommandDefinition, FlagOption, Option} from "@sirian/console";
import {debounce} from "@sirian/decorators";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import watch from "node-watch";
import * as path from "path";
import {Composer} from "../Composer";

export class ComposeCommand extends Command {
    protected get verbose(): boolean {
        return this.getOption("verbose");
    }

    public static configure(def: CommandDefinition) {
        def
            .addArguments([new Argument({name: "file", multiple: true, required: true})])
            .addOptions([
                new Option({name: "base"}),
                new Option({name: "config"}),
                new Option({name: "types-dir"}),
                new FlagOption({name: "watch", shortcut: "w"}),
            ])
            .setDescription("GraphQL Server");

        process.on("SIGINT", () => process.exit());
    }

    public async execute() {
        const files: string[] = this.getArgument("file");
        const watchFlag: boolean = this.getOption("watch");
        const base = this.getOption("base");
        const paths = base ? files.map((file) => path.resolve(base, file)) : files;
        this.compose(paths);

        if (watchFlag) {
            const watchOptions = {recursive: true, filter: /^.+\.(ts|js)$/};
            const watchDirectory = [...new Set(paths.map((file) => path.dirname(file))).values()];
            this.log("Schema watching:", watchDirectory);
            watch(watchDirectory, watchOptions, (e, file) => {
                const directory = watchDirectory.find((d) => file.startsWith(d));
                this.log("Schema", {event: e, directory, file});
                if (directory) {
                    const schemaFiles = paths.filter((schema) => schema.startsWith(directory));
                    if (schemaFiles.length > 0) {
                        this.compose(schemaFiles);
                    }
                }
            });
        }
    }

    public log(...msg: any) {
        if (this.verbose) {
            // tslint:disable-next-line:no-console
            console.log(...msg);
        }
    }

    @debounce(1000)
    protected compose(files: string[]) {
        const config: string = this.getOption("config");
        const typesDir: string = this.getOption("types-dir");
        for (const schemaPath of files) {
            const name = path.basename(schemaPath);
            const composer = new Composer({
                name,
                schemaPath,
                verbose: this.verbose,
                tsconfig: config,
            });

            const schemaFile = composer.save();
            if (typesDir) {
                const typesPath = path.resolve(typesDir);
                const graphqlSchemaFile = `${path.basename(schemaFile, ".json")}.graphql`;
                const project = Project.from(schemaFile);
                if (!existsSync(typesPath)) {
                    mkdirSync(typesPath, {recursive: true});
                }

                writeFileSync(path.join(typesPath, graphqlSchemaFile), project.toGraphQL());
            }
        }
    }
}
