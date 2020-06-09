export function* getPrototypeChain(target: ObjectConstructor) {
    let prototype = target.prototype;

    while (prototype) {
        yield prototype;
        prototype = Object.getPrototypeOf(prototype);
    }
}

export function getPropertyDescriptor(target: ObjectConstructor, property: string | symbol) {
    for (const prototype of getPrototypeChain(target)) {
        const descriptor = Reflect.getOwnPropertyDescriptor(prototype, property);
        if (descriptor) {
            return descriptor;
        }
    }
}
