# @graphly/schema

Create GraphQL schema/source from typemap cache.

This package is a part of [Graphly](https://github.com/graphly/graphly) project and uses by
`@graphly/type` to convert TypeScript classes to GraphQL schema.

## Install

`yarn add @graphly/schema`

## Usage

```typescript
import {Project} from "@graphly/schema";
import {MySchema} from "./Schema/MySchema.ts"

async function main() {
    const project = await Project.from(MySchema.getSchemaLocation());
    
    // convert project to GraphQL format
    console.log(project.toGraphQL());
    
    // convert project to GraphQLSchema
    console.log(project.toSchema());
}

main();
```

## Links

Read more about [this project](https://github.com/graphly/graphly).

## License
MIT
