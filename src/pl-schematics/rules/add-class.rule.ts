// src/pl-schematics/rules/add-class.rule.ts

import { strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { getProjectDefaultPath } from '../utils/workspace.utils';

export function addClass(
  options: PlSchematicsOptions,
  urlFile: string,
  destPath: string,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const defaultPath = getProjectDefaultPath(host, options);

    if (!defaultPath) {
      return host;
    }

    const sourceTemplate = url(urlFile);
    const source = apply(sourceTemplate, [
      template({
        ...options,
        name: options.namePackage,
        ...strings,
      }),
      move(defaultPath + '/' + destPath),
    ]);

    context.logger.info('Class created from: "' + urlFile + '"');

    return mergeWith(source);
  };
}