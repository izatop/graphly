#!/usr/bin/env node

import {Application} from "@sirian/console";
import {ComposeCommand} from "./Command/ComposeCommand";

const app = new Application({
    commands: [ComposeCommand],
});

app.run();
