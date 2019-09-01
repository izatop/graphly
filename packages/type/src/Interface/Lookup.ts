export type Lookup<C> = C extends object
    ? {[K in keyof C]: C[K] extends Promise<infer U> ? U : C[K]}
    : C;
