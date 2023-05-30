export function* getPrototypeChain(target: ObjectConstructor): Generator<any> {
    let prototype = target.prototype;

    while (prototype) {
        yield prototype;
        prototype = Object.getPrototypeOf(prototype);
    }
}

export function getPropertyDescriptor(target: ObjectConstructor, property: string | symbol)
    : TypedPropertyDescriptor<any> | undefined {
    for (const prototype of getPrototypeChain(target)) {
        const descriptor = Reflect.getOwnPropertyDescriptor(prototype, property);
        if (descriptor) {
            return descriptor;
        }
    }
}
