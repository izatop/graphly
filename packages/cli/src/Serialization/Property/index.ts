// tslint:disable:no-submodule-imports
import {Type} from "typedoc/dist/lib/models";
import {ProjectSerializer} from "../ProjectSerializer";
import {ArrayPropertySerializer} from "./ArrayPropertySerializer";
import {IntrinsicPropertySerializer} from "./IntrinsicPropertySerializer";
import {IPropertySerializer, PropertySerializer} from "./PropertySerializer";
import {ReferencePropertySerializer} from "./ReferencePropertySerializer";
import {ReflectionPropertySerializer} from "./ReflectionPropertySerializer";
import {TypeParameterPropertySerializer} from "./TypeParameterPropertySerializer";
import {UnionPropertySerializer} from "./UnionPropertySerializer";

type SerializerList<T extends Type> = {
    [key: string]: new (project: ProjectSerializer,
                        type: T) => PropertySerializer<T>;
};

const serializers: SerializerList<any> = {
    reference: ReferencePropertySerializer,
    array: ArrayPropertySerializer,
    union: UnionPropertySerializer,
    intrinsic: IntrinsicPropertySerializer,
    typeParameter: TypeParameterPropertySerializer,
    reflection: ReflectionPropertySerializer,
};

export const createPropertySerializer = (project: ProjectSerializer,
                                         data: IPropertySerializer<any>) => {
    if (data.type.type in serializers) {
        return new serializers[data.type.type](project, data);
    }
};
