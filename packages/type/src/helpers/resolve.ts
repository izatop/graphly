import {isPromiseLike} from "@sirian/common";
import {Lookup} from "../Interface";

export const resolve = async <C extends object>(source: C) => {
    const proto = source.constructor.prototype;
    const properties: Promise<[string, PropertyDescriptor]>[] = [];
    for (const [property, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(source))) {
        if (isPromiseLike(descriptor.value)) {
            properties.push(
                Promise.resolve(descriptor.value)
                    .then((value: any) => [property, {...descriptor, value}]),
            );

            continue;
        }

        properties.push(Promise.resolve([property, descriptor]));
    }

    const descriptors: Promise<[string, PropertyDescriptor]>[] = [];
    for (const [property, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (descriptor.get && !descriptor.set) {
            const value = descriptor.get.call(source);
            if (isPromiseLike(value)) {
                descriptors.push(
                    Promise.resolve(value)
                        .then((solve: any) => [property, {...descriptor, get: () => solve}]),
                );

                continue;
            }
        }

        descriptors.push(Promise.resolve([property, descriptor]));
    }

    const newProperties = {};
    for (const [property, value] of await Promise.all(properties)) {
        Reflect.set(newProperties, property, value);
    }

    const newPrototype = {};
    for (const [property, value] of await Promise.all(descriptors)) {
        Reflect.defineProperty(newPrototype, property, value);
    }

    return Object.seal(Object.create(newPrototype, newProperties)) as Lookup<C>;
};
