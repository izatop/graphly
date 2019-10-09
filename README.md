# graphly [![Build Status](https://travis-ci.org/graphly/graphly.svg?branch=master)](https://travis-ci.org/graphly/graphly)

Compose a great GraphQL apps on the fly with TypeScript and power of TypeDoc.
No more hell of decorators and pain with unreadable the GraphQLXXXType spaghetti! 

## Features

1. Writing the GraphQL schemas as a class tree.
2. Providing Service Container and Context State to the resolvers.
3. Defining independent GraphQL schemas nearby in one project.
4. Defining GraphQL types on the fly by an interface definition.

See [packages/test](https://github.com/graphly/graphly/tree/master/packages/test)
to meet the GraphQL schema definition example.

## Getting started

First you need install `@graphly/cli` and `@graphly/types`

`yarn add @graphly/cli @graphly/types` or `npm i @graphly/cli @graphly/types`

Next write your schema

MySchema/MySchema.ts
```typescript
import {Schema} from "@graphly/type";

export class MySchema extends Schema {
    public readonly query: MyQuery;

    /**
     * This method is required and uses to detect a schema path.
     */
    public static getSchemaLocation() {
        return __filename;
    }
}
```

MySchema/MyQuery.ts
```typescript
import {ObjectType} from "@graphly/type";

export class MyQuery extends ObjectType {
    public hello() {
        return "Hello, World";
    }
}
```

MySchema/MyContext.ts
```typescript
import {Context} from "@graphly/type";
import {MyContainer} from "./MyContainer";

export class MyContext extends Context<MyContainer, {}, {}> {}
```

MySchema/MyContainer.ts
```typescript
import {Container} from "@graphly/type";

export class MyContainer extends Container<{}> {}
```

Let's build a `typemap` of this schema `graphly-cli compose MySchema/MySchema.ts`
it will write `MySchema.json` nearby compiled MySchema.js.

Then you can use `Scope` from `@graphly/type` to define your own scope for this schema
and call `graphql`

```typescript
import {graphql} from "graphql";
import {Scope} from "@graphly/type";
import {MySchema} from "./MySchema/MySchema";
import {MyContext} from "./MySchema/MyContext";
import {MyContainer} from "./MySchema/MyContainer";

async function main() {
    const myScope = new Scope({
        schema: MySchema,
        context: MyContext,
        container: MyContainer,
        config: {},
    });
    
    const state = {};
    const config = await myScope.createConfig(state);
    
    console.log(await graphql(
        config.schema,
        `query MyQuery {hello}`,
        config.rootValue,
        config.context,
     ));
}
```

### Project structure

Typical structure of a project may be like this

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
MySchema/MyContainer.ts
MySchema/MyContext.ts
...
```

Remember that a project directory should contain only `schema`, `enum`, `context`
or `container` types.

### Resolvers

Resolvers are class methods which return only the output type. You can pass
only the input/service type as a resolver argument

```typescript
class TotoMutation extends ObjectType {
    public add(todo: TodoInput, context: MyContext): Returns<Todo> {
        return context.todos.add(todo);
    }
}
```

Sometimes TypeScript can resolve an incorrect return type like this:

```typescript
class MyQuery {
    public async session(context: MyContext) { // Promise<UserSession> | Promise<undefined>
        if (context.isAuthorized) {
            return context.userSession;
        }

        return undefined;
    }
}
```

To fix this behavior just force a return type for the resolver

```typescript
class MyQuery {
    public async session(context: MyContext): ReturnsNullable<UserSession> {
        // ...
    }
}
```

### Return types in resolves

Force use `Returns` or `Promise` for non-nullable and `ReturnsNullable`
for nullable (for `null` and `undefined` type too) in async resolvers.

```typescript
class MeQuery {
    public async me(): Returns<User> {
        // ...
    }

    public async bestFriend(): ReturnsNullable<User> {
        // ...
    }
}
```

### Service types

Context and Service Container are service types. Context is a request state
and Container is a global state and service provider like a database link
and so on.

You should linking context with container to getting relevant type in its context

```typescript
interface IConfig {
    dsn: string;
}

interface IState {
    user: User;
}

class MyContext extends Context<MyContainer, IConfig, IState> {
    public get currentUser() {
        return this.state.user;
    }

    public get todos() {
        return this.container.repository.collection("todos");
    }
}

class MyContainer extends Container<IConfig> {
    public get repository() {
        return createDbConnection(this.config.dsn);
    }
}
```   

The service type can be used as a resolver argument

```typescript
class TodoMutation extends ObjectType {
    public async add(todo: TodoInput, context: MyContext): Returns<Todo> {
        const {todos} = context;
        const {insertedId} = await todos.insertOne(todo);
        return todos.findOne({_id: insertedId});
    }
}
```

Remember, that `container` will be passed to `context` and resolver arguments
with resolved properties. It touches `container` getters too.

### Type generation on the fly

You can use interfaces to generating typically structures on the fly.
For example you can use pagination interface to auto-generate its type

```typescript
import {ObjectType, IObject, TypeInt, Returns} from "@graphly/type";

class TodoQuery extends ObjectType {
    public async search(offset: TypeInt = 0, limit: TypeInt = 10, context: MyContext): Returns<IPageable<Todo>> {
        const count = await context.todos.countDocuments();
        const node = await context.todos.find()
            .offset(offset)
            .limit(limit)
            .toArray();

        return {count, limit, offset, node}
    }
}

interface IPageable<T extends ObjectType> extends IObject {
    readonly count: TypeInt;
    readonly offset: TypeInt;
    readonly limit: TypeInt;
    readonly node: T[];
}
```

In this case `TodoQuery.search` will define a new type:

```graphql
type TodoQuerySearch {
    offset: Int!
    limit: Int!
    count: Int!
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

async function main() {
    const myScope = new Scope({
        schema: MySchema,
        context: MyContext,
        container: MyContainer,
        config,
    });
    
    const {schema, context, rootValue} = await myScope.createServerConfig({
        validateRequest,
        validateAuthorization,
        createSessionState(container, payload) {
            // check authorization and return context state
            return state;
        }
    });
    
    const server = new ApolloServer({
        schema,
        rootValue,
        context: ({req}) => context(req),
    });
    
    // ... run apollo server
}
```

## Limitations

It's a little bit difficult to parse all types of the TypeScript reflection so class schema has
some limitations for syntax that can be used:

1. Don't use spread syntax in resolver arguments.
2. Use Promise, AsyncIterator, Subscription and IObject only as a parents of return types.
3. Don't use nearby resolvers.
4. Be careful to use initial values of class members.

## Notice
Be notice that it's an experimental library, unstable for production and
may be changed its api in future.

## License
MIT
