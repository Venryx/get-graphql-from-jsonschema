import { Direction } from './Types/Direction';
import { parseType } from './parseType';
import { parseUnion } from './parseUnion';
import { toBreadcrumb } from './toBreadcrumb';
import { toPascalCase } from './toPascalCase';
import { TranslatableJsonSchema } from './Types/TranslatableJsonSchema';
import { source, stripIndent } from 'common-tags';
import * as errors from './errors';

const parseSchema = function ({ path, schema, direction, refToTypeName }: {
  path: string[];
  schema: TranslatableJsonSchema;
  direction: Direction;
  refToTypeName?: (refName: string) => string;
}): { typeName: string; typeDefinitions: string[] } {
  let result: { typeName: string; typeDefinitions: string[] };

  if ('$gqlType' in schema as any) {
    result = {
      typeName: (schema as any).gqlType,
      typeDefinitions: []
    };
  } else if ('$ref' in schema as any) {
    if (refToTypeName === undefined) {
      throw new Error(`A $ref was found in the schema at path ${toBreadcrumb([ ...path, '$ref' ])}, but no refToTypeName function was provided.`);
    }

    // Use ref's schema-name directly; do not add suffix, because we aren't the ones creating the graphql type, so the name may be valid.
    const typeName = refToTypeName((schema as any).$ref);

    result = {
      typeName,
      typeDefinitions: []
    };
  } else if ('enum' in schema) {
    const typeName = toPascalCase([ ...path, 'T0' ]);

    result = {
      typeName,
      typeDefinitions: [
        source`
          enum ${typeName} {
            ${schema.enum!.join('\n')}
          }
        `
      ]
    };
  } else if ('type' in schema) {
    result = parseType({ path, schema, direction, refToTypeName });
  } else if ('oneOf' in schema || 'anyOf' in schema) {
    result = parseUnion({ path, schema, direction, refToTypeName });
  } else {
    throw new errors.SchemaInvalid(`Structure at '${toBreadcrumb(path)}' not recognized. @schema:${JSON.stringify(schema, null, 2)}`);
  }

  if (result.typeName.includes('|')) {
    const typeName = toPascalCase(path);

    result.typeDefinitions.push(stripIndent`
      union ${typeName} = ${result.typeName}
    `);
    result.typeName = typeName;
  }

  return result;
};

export { parseSchema };
