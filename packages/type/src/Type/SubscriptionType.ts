import {ResolverArgs, SchemaType} from "../Interface";
import {TypeAbstract} from "./TypeAbstract";

export type Subscription<T> = Promise<AsyncIterator<T>> | AsyncIterator<T>;
export type SubscribeFunction<T> = (...args: ResolverArgs[]) => Subscription<T>;

export class SubscriptionType {
    [key: string]: SubscribeFunction<SchemaType | SchemaType[] | TypeAbstract | TypeAbstract[]>;
}
