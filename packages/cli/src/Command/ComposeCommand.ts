import {Argument, Command, CommandDefinition, FlagOption, Option} from "@sirian/console";
import * as path from "path";
import {Composer} from "../Composer";

export class ComposeCommand extends Command {
    public static configure(def: CommandDefinition) {
        def
            .addArguments([new Argument({name: "file", multiple: true, required: true})])
            .addOptions([
                new Option({name: "base"}),
                new FlagOption({name: "watch", shortcut: "w"}),
            ])
            .setDescription("GraphQL Server");
    }

    public async execute() {
        const files = this.getArgument("file");
        const verbose = this.getOption("verbose");

        for (const schemaPath of files) {
            const name = path.basename(schemaPath);
            const composer = new Composer({
                name,
                schemaPath,
                verbose,
            });

            composer.save();
        }
    }
}
