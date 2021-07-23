import { Direction } from './Types/Direction';
import { parseSchema } from './parseSchema';
import { TranslatableTypeJsonSchema } from './Types/TranslateableTypeJsonSchema';
import { TranslatableUnionJsonSchema } from './Types/TranslatableUnionJsonSchema';

const parseUnion = function ({ path, schema, direction, refToTypeName }: {
  path: string[];
  schema: TranslatableUnionJsonSchema;
  direction: Direction;
  refToTypeName?: (refName: string) => string;
}): { typeName: string; typeDefinitions: string[] } {
  let subSchemas: TranslatableTypeJsonSchema[];

  if ('oneOf' in schema) {
    subSchemas = schema.oneOf;
  } else {
    subSchemas = schema.anyOf;
  }

  const graphqlTypeDefinitions: string[] = [],
        graphqlTypeNames: string[] = [];

  subSchemas.forEach((subSchema, index): void => {
    if (subSchema.type as any === 'null') {
      return;
    }
    const result = parseSchema({ schema: subSchema, direction, path: [ ...path, `I${index}` ], refToTypeName });

    graphqlTypeNames.push(result.typeName);
    graphqlTypeDefinitions.push(...result.typeDefinitions);
  });

  const graphqlTypeName = graphqlTypeNames.
    filter((name): boolean => name.trim() !== '').
    join(' | ');

  return {
    typeName: graphqlTypeName,
    typeDefinitions: graphqlTypeDefinitions
  };
};

export { parseUnion };
