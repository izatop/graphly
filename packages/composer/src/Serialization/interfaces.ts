export interface IType {
    name: string;
    file: string;
    base: TypeBaseClass;
    abstract?: boolean;
    reference: string;
    parameter?: string[];
    property: Array<(IProperty | IPropertyResolver)>;
}

export class PropertyBox {
    public readonly args: [PropertyType, ...PropertyType[]];
    constructor(public readonly type: string,
                ...args: [PropertyType, ...PropertyType[]]) {
        this.args = args;
    }
}

export type PropertyType = PropertyBox | string | Array<PropertyBox | string>;

export interface IProperty {
    name: string;
    nullable: boolean;
    type: PropertyType;
    defaultValue?: string;
}

export interface IPropertyResolver extends IProperty {
    resolver: IProperty[];
}

export enum TypeBaseClass {
    None,
    Enum = "Enum",
    InputType = "InputType",
    TypeAbstract = "TypeAbstract",
    QueryType = "QueryType",
    MutationType = "MutationType",
    SubscriptionType = "SubscriptionType",
    InterfaceType = "InterfaceType",
    Schema = "Schema",
    Context = "Context",
    Container = "Container",
}
