import {Argument, Command, CommandDefinition, FlagOption, Option} from "@sirian/console";
import {debounce} from "@sirian/decorators";
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
                new Option({name: "config", shortcut: "c"}),
                new Option({name: "base"}),
                new FlagOption({name: "watch", shortcut: "w"}),
            ])
            .setDescription("GraphQL Server");

        process.on("SIGINT", () => process.exit());
    }

    public async execute() {
        const files: string[] = this.getArgument("file");
        const watchFlag: boolean = this.getOption("watch");

        this.compose(files);
        if (watchFlag) {
            const watchOptions = {recursive: true, filter: /^.+\.(ts|js)$/};
            const watchDirectory = files.map((file) => path.dirname(file));
            // tslint:disable-next-line:no-console
            this.log("Schema watching:", watchDirectory);
            watch(watchDirectory, watchOptions, (e, file) => {
                // tslint:disable-next-line:no-console
                this.log("Schema", e, file);
                const directory = watchDirectory.find((d) => file.startsWith(d));
                if (directory) {
                    const schemaFiles = files.filter((schema) => schema.startsWith(directory));
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
        for (const schemaPath of files) {
            const name = path.basename(schemaPath);
            const composer = new Composer({
                name,
                schemaPath,
                verbose: this.verbose,
                tsconfig: config,
            });

            composer.save();
        }
    }
}
