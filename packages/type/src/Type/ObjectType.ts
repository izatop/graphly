import {$InType, $Nullable, Arrayable, OutputType, Promisable, Resolvable} from "../Interface";

export abstract class ObjectType {
    readonly [key: string]: Resolvable<Arrayable<OutputType>>;

    protected $resolve<T, D>(data: $InType<T, D>): Promisable<D>;
    protected $resolve<T, D>(data: $InType<T, D> | $Nullable): Promisable<D | $Nullable>;
    protected $resolve<T, D>(data: any) {
        return data;
    };

    protected $map<T, D>(data: $InType<T, D>[]): D[];
    protected $map<T, D>(data: any) {
        return data;
    };
}
