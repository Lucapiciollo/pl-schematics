// src/pl-schematics/index.ts

import { chain, noop, Rule } from '@angular-devkit/schematics';

import { check } from './checkVersion';

import { addMaterialModuleImports } from './rules/add-material-module-imports.rule';
import { addPackageJsonDependencies } from './rules/add-package-json-dependencies.rule';
import { addRootModuleImports } from './rules/add-root-module-imports.rule';
import { addTemplateFiles } from './rules/add-template-files.rule';
import { getPrefixFromAngularJson } from './rules/get-prefix-from-angular-json.rule';
import { installPackageJsonDependencies } from './rules/install-package-json-dependencies.rule';
import { logOptions } from './rules/log-options.rule';
import { normalizeOptions } from './rules/normalize-options.rule';
import { scaffoldEmptyFolders } from './rules/scaffold-empty-folders.rule';
import { updateAngularJsonForBootstrap } from './rules/update-angular-json-bootstrap.rule';
import { updateAngularJsonForMaterial } from './rules/update-angular-json-material.rule';
import { updateIndexHtmlForMaterial } from './rules/update-index-html-material.rule';
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

    /**
     * Copia tutti i template configurati in:
     * src/pl-schematics/config/template-folders.config.ts
     *
     * Qui dentro ora gestiamo anche:
     * - advanced-logging
     * - mock-api-node
     * - ci-azure-devops
     * - ci-github-actions
     * - material
     * - documentation opzionale
     */
    addTemplateFiles(options),

    /**
     * Angular Material
     */
    updateAngularJsonForMaterial(options),
    updateIndexHtmlForMaterial(options),

    /**
     * Bootstrap legacy.
     * Viene eseguito solo se normalizeOptions lascia addSupportBootstrap === 'Y'.
     * Se ui !== 'bootstrap', normalizeOptions dovrebbe impostarlo a 'N'.
     */
    options.addSupportBootstrap === 'Y'
      ? updateAngularJsonForBootstrap(options)
      : noop(),

    /**
     * SonarQube.
     */
    options.enableSonarQube === 'Y'
      ? updatePackageJsonForSonar()
      : noop(),

    /**
     * Package scripts:
     * - build-dev
     * - build-prod
     * - typedoc
     * - mock-api se mockApi === 'node-express'
     */
    updatePackageJsonForBuild(options),

    /**
     * Cartelle vuote con .gitkeep.
     */
    scaffoldEmptyFolders(options),

    /**
     * Import base nel root module, quando esiste AppModule.
     */
    addRootModuleImports(options),

    /**
     * Import MaterialModule e BrowserAnimationsModule, solo con ui=material.
     */
    addMaterialModuleImports(options),

    /**
     * Check versione pl-core-utils-library.
     */
    check({
      'pl-core-utils-library': '',
    }),
  ]);
}