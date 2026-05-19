// src/pl-schematics/rules/scaffold-schematics.rule.ts

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { getProjectDefaultPath } from '../utils/workspace.utils';

export function scaffoldSchematics(
  options: PlSchematicsOptions,
  destPath: string,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const defaultPath = getProjectDefaultPath(host, options);

    if (!defaultPath) {
      return host;
    }

    const filePath = defaultPath + '/' + destPath + '/.gitkeep';

    if (host.exists(filePath)) {
      context.logger.info('Empty folder already exists: "' + filePath + '"');
      return host;
    }

    host.create(filePath, '');

    context.logger.info('Created empty folder: "' + filePath + '"');

    return host;
  };
}