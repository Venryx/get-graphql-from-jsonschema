import { Direction } from './Types/Direction';
import { parseType } from './parseType';
import { parseUnion } from './parseUnion';
import { toBreadcrumb } from './toBreadcrumb';
import { toPascalCase } from './toPascalCase';
import { TranslatableJsonSchema } from './Types/TranslatableJsonSchema';
import { source, stripIndent } from 'common-tags';
import * as errors from './errors';

const parseSchema = function ({ path, schema, direction }: {
  path: string[];
  schema: TranslatableJsonSchema;
  direction: Direction;
}): { typeName: string; typeDefinitions: string[] } {
  let result: { typeName: string; typeDefinitions: string[] };

  if ('enum' in schema) {
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
    result = parseType({ path, schema, direction });
  } else if ('oneOf' in schema || 'anyOf' in schema) {
    result = parseUnion({ path, schema, direction });
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
