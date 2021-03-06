import {$InType, $Nullable, Promisable} from "../Interface";
import {Subscription} from "../Type";

export function $resolve<T, D>(data: $InType<T, D>): Promisable<D>;
export function $resolve<T, D>(data: $InType<T, D> | $Nullable): Promisable<D | $Nullable>;
export function $resolve<T, D>(data: any) {
    return data;
}

export function $async<T, D>(data: Promise<$InType<T, D>[]>): Promise<D[]>;
export function $async<T, D>(data: Promise<$InType<T, D>>): Promise<D>;
export function $async<T, D>(data: Promise<$InType<T, D> | $Nullable>): Promise<D | $Nullable>;
export function $async<T, D>(data: any) {
    return data;
}

export function $map<T, D>(data: $InType<T, D>[]): D[];
export function $map<T, D>(data: any) {
    return data;
}

export function $subscribe<T, D>(iterator: Promise<AsyncIterable<$InType<T, D>>>): Promise<Subscription<D>>;
export function $subscribe<T, D>(iterator: Promise<AsyncIterable<$InType<T, D>>>): Promise<Subscription<D | $Nullable>>;
export function $subscribe<T, D>(iterator: AsyncIterable<$InType<T, D>>): Subscription<D>;
export function $subscribe<T, D>(iterator: AsyncIterable<$InType<T, D> | $Nullable>): Subscription<D | $Nullable>;
export function $subscribe(iterator: AsyncIterable<any> | Promise<AsyncIterable<any>>) {
    return iterator;
}
