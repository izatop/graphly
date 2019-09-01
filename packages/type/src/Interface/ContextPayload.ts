import {IncomingHttpHeaders, IncomingMessage} from "http";
export type ContextPayload = {
    readonly headers: IncomingHttpHeaders;
    readonly request: IncomingMessage;
    readonly authorization?: {
        readonly raw: string;
        readonly basic?: Readonly<{username: string, password: string}>;
        readonly bearer?: string;
    };
};
