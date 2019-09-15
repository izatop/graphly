# graphly

Compose a great GraphQL apps on the fly with TypeScript and power of TypeDoc.
No more hell of decorators and pain with unreadable the GraphQLXXXType spaghetti! 

## Features

1. Writing a schema as a tree of classes.
2. Class properties may be declared as a type or a resolver.
3. Auto passing a service container and a context to resolvers.
4. Schemas can be separated in independent scopes.
5. Auto-generated return types with generics and interfaces.

See packages/test to meet a full schema example.

### Tree of schema types

Usage example

```typescript
import {ObjectType, Schema} from "@graphly/type";

export class MySchema extends Schema {
    public readonly query: MyQuery;

    public static getSchemaLocation() {
        return __filename;
    }
}

export class MyQuery extends ObjectType {
  public readonly todo: TodoQuery;
}

export class TodoQuery extends ObjectType {
    public find(id: number): Promise<Todo> {
        // ...
    }
}

export class Todo extends ObjectType {
    public readonly id: number;
    public readonly title: string;
    public readonly status: TodoStatus;
    public get statusText() {
        return this.status ? "Open" : "Close";
    } 
}

export enum TodoStatus {
    OPEN,
    CLOSE,
}
```

I recommend separate schema classes as one class per file like this:

```
MySchema
MySchema/MySchema.ts
MySchema/MyQuery.ts
MySchema/MyMutation.ts
MySchema/Query/TodoQuery.ts
MySchema/Query/Todo.ts
MySchema/Query/Todo/TodoStatus.ts
MySchema/Mutation/TodoMutation.ts
MySchema/Input/TodoInput.ts
... and etc
    
```

Put into this directory only a schema and context/container files.

### Resolvers

Any public property of a class may be a type or a resolver.

```typescript
import {ObjectType, InputObjectType} from "@graphly/type";

class TotoMutation extends ObjectType {
    public add(todo: TodoInput, context: MyContext): Promise<Todo> {
        return context.todos.add(todo);
    }
}

class TodoInput extends InputObjectType {
    public readonly id: number;
    public readonly title: string = "New Todo";
    public readonly status: TodoStatus = TodoStatus.OPEN;
}
```

Sometimes TypeScript can resolve an incorrect return type like this:

```typescript
class MyQuery {
    public async session(context: MyContext) {
        if (context.isAuthorized) { // Promise<UserSession> | Promise<undefined>
            return context.userSession;
        }

        return undefined;
    }
}
```

Just force a return type declaration for the resolver:

```typescript
class MyQuery {
    public async session(context: MyContext): Promise<UserSession | undefined> {
        // ...
    }
}
```

### Context and service Container

You can pass any of Context or Container as argument to 
a resolver method with input arguments.

```typescript
import {Context, Container, ObjectType} from "@graphly/type";
import {IConfig, IState} from "./interfaces";

class MyQuery extends ObjectType {
    public me(context: MyContext) {
        return context.user;
    }
}

class MyContext extends Context<MyContainer, IConfig, IState> {
    public get user() {
        return this.state.user;
    }
}

class MyContainer extends Container<IConfig> {
    public get repository() {
        return createDbConnection(this.config.db.connectionString);
    }
}
```

### Auto generation object types

```typescript
import {ObjectType, IObject, TypeInt} from "@graphly/type";

class TodoQuery extends ObjectType {
    public async search(offset: TypeInt = 0, limit: TypeInt = 10, context: MyContext): Promise<IPageable<Todo>> {
        const node = await context.rodos.find()
            .offset(offset)
            .limit(limit);

        return {limit, offset, node}
    }
}

interface IPageable<T extends ObjectType> extends IObject {
    readonly offset: TypeInt;
    readonly limit: TypeInt;
    readonly node: T[];
}
```

In this case `TodoQuery.search` will return a new type:

```graphql
type TodoQuerySearch {
    offset: Int!
    limit: Int!
    node: [Todo!]!
}
```

## Use with Apollo

```typescript
import {Scope} from "@graphly/type";
import {MySchema} from "./MySchema";
import {MyContext} from "./MyContext";
import {MyContainer} from "./MyContainer";
import {config} from "./config";

const myScope = new Scope({
    schema: MySchema,
    context: MyContext,
    container: MyContainer,
    config,
});

const server = new ApolloServer(myScope.createServerConfig({
    validateRequest,
    validateAuthorization,
    createSessionState(container, payload) {
        // check authorization and return context state
        return state;
    }
}));

// ...
```

## Limitations

It's a little bit difficult to parse all types of the TypeScript reflection so class schema has
some limitations for syntax that can be used.

1. Don't use spread syntax in resolver arguments.
2. Use Promise, AsyncIterator and IObject only as a return type.
3. Don't use nearby resolvers.
4. Be careful to use initial values of class members.

## Notice
Be notice that it's an experimental library, unstable for production and
may be changed its api in future.

## License
MIT
