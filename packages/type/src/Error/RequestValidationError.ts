export class RequestValidationError extends Error {
    constructor(message = "Request validation error") {
        super(message);
    }
}
