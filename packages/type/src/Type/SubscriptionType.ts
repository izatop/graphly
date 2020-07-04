import {$InType, $Nullable, OutputType, Promisable, ResolverArgs} from "../Interface";

export type Subscription<T> = Promisable<AsyncIterator<T>>;
export type SubscribeFunction<T> = (...args: ResolverArgs[]) => Subscription<T>;

export abstract class SubscriptionType {
    [key: string]: SubscribeFunction<OutputType>;

    protected $resolve<T, D>(iterator: AsyncIterator<$InType<T, D>>): Subscription<D>;
    protected $resolve<T, D>(iterator: AsyncIterator<$InType<T, D> | $Nullable>): Subscription<D | $Nullable>;
    protected $resolve<T, D>(iterator: AsyncIterator<any>) {
        return iterator;
    }
}
