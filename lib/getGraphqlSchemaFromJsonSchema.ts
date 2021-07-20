import { Direction } from './Types/Direction';
import { parseSchema } from './parseSchema';
import { TranslatableJsonSchema } from './Types/TranslatableJsonSchema';

const getGraphqlSchemaFromJsonSchema = function ({ rootName, schema, direction = 'output', refToTypeName }: {
  rootName: string;
  schema: TranslatableJsonSchema;
  direction?: Direction;
  refToTypeName?: (refName: string) => string;
}): { typeName: string; typeDefinitions: string[] } {
  return parseSchema({ path: [ rootName ], schema, direction, refToTypeName });
};

export { getGraphqlSchemaFromJsonSchema };
