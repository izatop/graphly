export class AccessDenied extends Error {
    constructor(message = "Access denied") {
        super(message);
    }
}
