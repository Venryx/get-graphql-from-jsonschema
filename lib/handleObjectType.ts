import { Direction } from './Types/Direction';
import { parseSchema } from './parseSchema';
import { toPascalCase } from './toPascalCase';
import { TranslatableObjectTypeJsonSchema } from './Types/TranslatableObjectTypeJsonSchema';

const handleObjectType = function ({ path, schema, direction, refToTypeName }: {
  path: string[];
  schema: TranslatableObjectTypeJsonSchema;
  direction: Direction;
  refToTypeName?: (refName: string) => string;
}): { typeName: string; typeDefinitions: string[] } {
  const graphqlTypeName = toPascalCase(path);
  const graphqlTypeDefinitions: string[] = [];

  const lines = [];

  for (const [ propertyName, propertySchema ] of Object.entries(schema.properties)) {
    const isRequired = (
      schema.required && schema.required.includes(propertyName)
    ) ?? false;

    const {
      typeName: propertyGraphqlTypeName,
      typeDefinitions: propertyGraphqlTypeDefinitions
    } = parseSchema({
      path: [ ...path, propertyName ],
      schema: propertySchema,
      direction,
      refToTypeName
    });

    let line = `  ${propertyName}: ${propertyGraphqlTypeName}`;

    line += isRequired ? '!\n' : '\n';

    lines.push(line);
    graphqlTypeDefinitions.push(...propertyGraphqlTypeDefinitions);
  }

  let currentGraphqlTypeDefinition = '';

  currentGraphqlTypeDefinition += direction === 'input' ? 'input' : 'type';

  if (lines.length > 0) {
    currentGraphqlTypeDefinition += ` ${graphqlTypeName} {\n`;

    for (const line of lines) {
      currentGraphqlTypeDefinition += line;
    }

    currentGraphqlTypeDefinition += '}';
  } else {
    currentGraphqlTypeDefinition += ` ${graphqlTypeName}`;
  }

  graphqlTypeDefinitions.push(currentGraphqlTypeDefinition);

  return {
    typeName: graphqlTypeName,
    typeDefinitions: graphqlTypeDefinitions
  };
};

export { handleObjectType };
