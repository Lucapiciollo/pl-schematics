import { chain, noop, Rule } from '@angular-devkit/schematics';

import { check } from './checkVersion';
import { addPackageJsonDependencies } from './rules/add-package-json-dependencies.rule';
import { addRootModuleImports } from './rules/add-root-module-imports.rule';
import { addTemplateFiles } from './rules/add-template-files.rule';
import { getPrefixFromAngularJson } from './rules/get-prefix-from-angular-json.rule';
import { installPackageJsonDependencies } from './rules/install-package-json-dependencies.rule';
import { logOptions } from './rules/log-options.rule';
import { normalizeOptions } from './rules/normalize-options.rule';
import { scaffoldEmptyFolders } from './rules/scaffold-empty-folders.rule';
import { updateAngularJsonForBootstrap } from './rules/update-angular-json-bootstrap.rule';
import {
  updatePackageJsonForBuild,
  updatePackageJsonForSonar,
} from './rules/update-package-json.rule';
import { validateOptions } from './rules/validate-options.rule';
import { PlSchematicsOptions } from './types/schema-options';

export default function plSchematics(options: PlSchematicsOptions): Rule {
  return chain([
    normalizeOptions(options),
    validateOptions(options),
    getPrefixFromAngularJson(options),

    addPackageJsonDependencies(options),
    installPackageJsonDependencies(),
    logOptions(options),

    addTemplateFiles(options),

    options.addSupportBootstrap === 'Y'
      ? updateAngularJsonForBootstrap(options)
      : noop(),

    options.enableSonarQube === 'Y'
      ? updatePackageJsonForSonar()
      : noop(),

    updatePackageJsonForBuild(options),

    scaffoldEmptyFolders(options),
    addRootModuleImports(options),

    check({
      'pl-core-utils-library': '',
    }),
  ]);
}