# @graphly/composer

Compose GraphQL schema with TypeScript reflection.

This package is a part of [Graphly](https://github.com/graphly/graphly) project and uses by
`@graphly/type` to convert TypeScript classes to GraphQL schema.

## Install

`yarn add @graphly/composer`

## Usage

```typescript
import {Composer} from "@graphly/composer";

const composer = new Composer({
    basePath: __dirname,
    schemaPath: "Schema/TestSchema.ts",
    verbose: false,
});

const project = composer.compose();

// convert project to GraphQL format
console.log(project.toGraphQL());

// convert project to GraphQLSchema
console.log(project.toSchema());
```

## Links

Read more about [this project](https://github.com/graphly/graphly).

## License
MIT
