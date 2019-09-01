import {TypeAbstract} from "./TypeAbstract";

export abstract class MutationType<P extends MutationType<any> = any> extends TypeAbstract<P> {
}
