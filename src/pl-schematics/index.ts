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
import { normalizeOptionsSync, normalizeProjectAndPrefix } from './rules/normalize-options.rule';
import { scaffoldEmptyFolders } from './rules/scaffold-empty-folders.rule';
import { updateAngularJsonForBootstrap } from './rules/update-angular-json-bootstrap.rule';
import { updateAngularJsonForMaterial } from './rules/update-angular-json-material.rule';
import { updateIndexHtmlForMaterial } from './rules/update-index-html-material.rule';
 import {
  updatePackageJsonForBuild,
  updatePackageJsonForSonar,
} from './rules/update-package-json.rule';
import { validateOptions } from './rules/validate-options.rule';
import { updateAngularJsonForEnvironments } from './rules/update-angular-json-environments.rule';
import { PlSchematicsOptions } from './types/schema-options';
import { addNgrxModuleImports } from './rules/add-ngrx-module-imports.rule';
import { addSharedLibrary } from './rules/add-shared-library.rule';
import { addNgrxLibrary } from './rules/add-ngrx-library.rule';

export default function plSchematics(options: PlSchematicsOptions): Rule {
  /**
   * @author l.piciollo
   * ATTENZIONE: normalizeOptionsSync() va chiamata qui, in modo sincrono e PRIMA
   * di costruire l'array passato a chain([...]) qui sotto. Diverse voci della
   * chain (es. addSharedLibrary/addNgrxLibrary, che leggono subito
   * options.sharedLibName/options.ngrxLibName; i ternari su
   * options.addSupportBootstrap/options.enableSonarQube piu' sotto) leggono i
   * valori normalizzati in modo sincrono, PRIMA che una qualsiasi Rule (lazy per
   * definizione) abbia la possibilita' di eseguire il proprio corpo. Vedi i
   * commenti in normalize-options.rule.ts per il dettaglio.
   */
  normalizeOptionsSync(options);

  return chain([
    normalizeProjectAndPrefix(options),
    validateOptions(options),

    getPrefixFromAngularJson(options),
    addNgrxModuleImports(options),
    addPackageJsonDependencies(options),
    installPackageJsonDependencies(),
    logOptions(options),

    /**
     * Librerie Angular vere e proprie (projects/<namePackage>-shared,
     * projects/<namePackage>-ngrx), generate PRIMA dei template applicativi:
     * componenti/moduli/pipe/servizi condivisi e, se abilitato, lo store NgRx.
     * La libreria shared importa StateModule dalla libreria ngrx quando
     * presente, quindi quest'ultima va registrata per prima.
     */
    options.state === 'ngrx' ? addNgrxLibrary(options) : noop(),
    addSharedLibrary(options),

    /**
     * Copia tutti i template configurati in:
     * src/pl-schematics/config/template-folders.config.ts
     *
     * Qui dentro ora gestiamo anche:
     * - mock-api-node
     * - ci-azure-devops
     * - ci-github-actions
     * - documentation opzionale
     */
    addTemplateFiles(options),
    updateAngularJsonForEnvironments(options),

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