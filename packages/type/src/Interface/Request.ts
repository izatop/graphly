import {IncomingMessage} from "http";
import {Container} from "../Scope";
import {KeyValue} from "./index";

export type RequestLifecycleHooks<TState extends KeyValue, C extends Container = Container> = {
    /**
     * Validate a request payload.
     *
     * @throws RequestValidationError
     * @param payload
     */
    validateRequest?: (container: C, payload: Request) => Promise<boolean>;

    /**
     * Validate authorization.
     * This method calls after Container.validateRequest.
     *
     * @throws AccessDenied
     * @param payload
     */
    validateAuthorization?: (container: C, payload: Request) => Promise<boolean>;

    /**
     * Create session state. You also can validate a request payload
     * (for session for example) in this context.
     * This method calls after Container.validateAuthorization.
     *
     * @param payload
     * @returns Promise<TState>
     */
    createSessionState?: (container: C, payload: Request) => Promise<TState>;
};

export type AuthorizationContext = Readonly<{
    raw: string;
    type?: string;
    credentials: string;
}>;

export type Request = {
    readonly authorization?: AuthorizationContext;
    readonly request: IncomingMessage;
};
