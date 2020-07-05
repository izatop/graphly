import {OutputType, Promisable, ResolverArgs} from "../Interface";

export type Subscription<T> = Promisable<AsyncIterator<T>>;
export type SubscribeFunction<T> = (...args: ResolverArgs[]) => Subscription<T>;

export abstract class SubscriptionType {
    [key: string]: SubscribeFunction<OutputType>;
}
