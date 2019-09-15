import {IncomingMessage} from "http";
import {AccessDenied} from "../Error/AccessDenied";
import {RequestValidationError} from "../Error/RequestValidationError";
import {AuthorizationContext, Lookup, RequestLifecycleHooks} from "../Interface";
import {Container} from "../Scope";

export class RequestContext {
    public static createContextState<TState, C extends Container>(hooks: RequestLifecycleHooks<TState, C>,
                                                                  container: Lookup<C>) {
        return async (request: IncomingMessage): Promise<TState> => {
            const authorization = this.createAuthorizationContext(request);
            const payload = {authorization, request};
            if (hooks.validateRequest) {
                this.assert(
                    await hooks.validateRequest(container, payload),
                    () => new RequestValidationError(),
                );
            }

            if (hooks.validateAuthorization) {
                this.assert(
                    await hooks.validateAuthorization(container, payload),
                    () => new AccessDenied(),
                );
            }

            if (hooks.createSessionState) {
                return hooks.createSessionState(container, payload);
            }

            return {} as any;
        };
    }

    public static createAuthorizationContext(request: IncomingMessage): AuthorizationContext | undefined {
        const {headers} = request;
        if (headers.authorization) {
            const [type, ...credentials] = headers.authorization.split(" ");
            return {
                type,
                credentials: credentials.join(" "),
                raw: headers.authorization,
            };
        }

        return;
    }

    public static assert(test: boolean, throws: () => Error) {
        if (!test) {
            throw throws();
        }
    }
}
