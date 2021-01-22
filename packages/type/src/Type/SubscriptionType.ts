import {OutputType, ResolverArgs} from "../Interface";

export type Subscription<T> = AsyncIterable<T>;
export type SubscribeFunction<T> = (...args: ResolverArgs[]) => Subscription<T>;
export type SubscribeFunctionAsync<T> = (...args: ResolverArgs[]) => Promise<Subscription<T>>;

export abstract class SubscriptionType {
    [key: string]: SubscribeFunction<OutputType> | SubscribeFunctionAsync<OutputType>;
}
