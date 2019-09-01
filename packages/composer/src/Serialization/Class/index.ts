import {DeclarationReflection} from "typedoc";
import {TypeBaseClass} from "../interfaces";
import {ProjectSerializer} from "../ProjectSerializer";
import {InputTypeSerializer} from "./InputTypeSerializer";
import {InterfaceTypeSerializer} from "./InterfaceTypeSerializer";
import {ISchemaTypeSerializerParameter, ObjectTypeSerializer} from "./ObjectTypeSerializer";
import {ServiceTypeSerializer} from "./ServiceTypeSerializer";

type SerializerList<T extends ObjectTypeSerializer = ObjectTypeSerializer> = {
    [key: string]: new (project: ProjectSerializer,
                        type: ISchemaTypeSerializerParameter) => T;
};

const serializers: SerializerList = {
    [TypeBaseClass.InputType]: InputTypeSerializer,
    [TypeBaseClass.QueryType]: ObjectTypeSerializer,
    [TypeBaseClass.MutationType]: ObjectTypeSerializer,
    [TypeBaseClass.SubscriptionType]: ObjectTypeSerializer,
    [TypeBaseClass.TypeAbstract]: ObjectTypeSerializer,
    [TypeBaseClass.Container]: ServiceTypeSerializer,
    [TypeBaseClass.Context]: ServiceTypeSerializer,
    [TypeBaseClass.InterfaceType]: InterfaceTypeSerializer,
    [TypeBaseClass.Schema]: ObjectTypeSerializer,
};

export const createClassSerializer = (project: ProjectSerializer,
                                      base: TypeBaseClass,
                                      declaration: DeclarationReflection) => {
    if (base in serializers) {
        return new serializers[base](project, {declaration, base});
    }
};
