// src/pl-schematics/index.ts

/**
 * @author l.piciollo
 * Entry point dello schematic "pl-schematics" (registrato in collection.json).
 * Costruisce la chain di rule che, nell'ordine: valida le opzioni, aggiunge le dipendenze
 * a package.json, crea le librerie shared/ngrx, copia i template applicativi, aggiorna
 * angular.json (environments, assets, localize, budgets, Material, Bootstrap), index.html,
 * gli script di package.json (Sonar/build), crea le cartelle vuote e infine configura
 * l'app shell (modulo/config root, routing, componente root).
 */

import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { addNgrxLibrary } from './rules/add-ngrx-library.rule';
import { addPackageJsonDependencies } from './rules/add-package-json-dependencies.rule';
import { addSharedLibrary } from './rules/add-shared-library.rule';
import { addTemplateFiles } from './rules/add-template-files.rule';
import { logOptions } from './rules/log-options.rule';
import { normalizeOptionsSync, resolveWorkspaceOptions } from './rules/normalize-options.rule';
import { scaffoldEmptyFolders } from './rules/scaffold-empty-folders.rule';
import { updateAngularJsonForAssets } from './rules/update-angular-json-assets.rule';
import { updateAngularJsonForBootstrap } from './rules/update-angular-json-bootstrap.rule';
import { updateAngularJsonForBudgets } from './rules/update-angular-json-budgets.rule';
import { updateAngularJsonForLocalize } from './rules/update-angular-json-localize.rule';
import { updateAngularJsonForEnvironments } from './rules/update-angular-json-environments.rule';
import { updateAngularJsonForMaterial } from './rules/update-angular-json-material.rule';
import { updateAppShell } from './rules/update-app-shell.rule';
import { updateIndexHtmlForMaterial } from './rules/update-index-html-material.rule';
import { updatePackageJsonForBuild, updatePackageJsonForSonar } from './rules/update-package-json.rule';
import { validateOptions } from './rules/validate-options.rule';
import { PlSchematicsOptions } from './types/schema-options';

/**
 * @author l.piciollo
 * Factory dello schematic: normalizza le opzioni e restituisce la Rule che, al momento
 * dell'esecuzione, risolve le opzioni dipendenti dal workspace e compone la chain di rule.
 * @param options  :opzioni ricevute dalla CLI (schema.json), modificate in place dalle fasi di normalizzazione
 * @returns Rule che esegue l'intera generazione sul Tree
 */
export default function plSchematics(options: PlSchematicsOptions): Rule {
  /**
   * @author l.piciollo
   * 1) normalizeOptionsSync(): opzioni che non richiedono il Tree (valori di default,
   *    nomi delle librerie derivati da namePackage). Sincrona e PRIMA di costruire le rule.
   * 2) resolveWorkspaceOptions(): legge il workspace (progetto, prefix, major di Angular,
   *    architettura classic/standalone rilevata da main.ts). Le rule che dipendono da
   *    questi valori vengono quindi costruite DOPO, qui dentro, con le opzioni definitive
   *    (una Rule e' lazy: il suo corpo gira solo quando il motore esegue la chain).
   */
  normalizeOptionsSync(options);

  return (host: Tree, context: SchematicContext) => {
    resolveWorkspaceOptions(host, options, context);

    return chain([
      validateOptions(options),

      /**
       * Dipendenze con versioni pinnate per major di Angular; l'installazione viene
       * schedulata automaticamente da addDependency (una sola volta).
       */
      addPackageJsonDependencies(options),
      logOptions(options),

      /**
       * Librerie Angular vere e proprie (projects/<libBase>-shared, projects/<libBase>-ngrx).
       * Le due librerie sono indipendenti: lo StateModule viene importato dall'app.
       */
      options.state === 'ngrx' ? addNgrxLibrary(options) : noop(),
      addSharedLibrary(options),

      /**
       * Template applicativi (core, home, environment, asset, CI, mock-api, ...)
       * specifici per l'architettura rilevata.
       */
      addTemplateFiles(options),
      updateAngularJsonForEnvironments(options),
      updateAngularJsonForAssets(options),
      updateAngularJsonForLocalize(options),
      updateAngularJsonForBudgets(options),

      /**
       * UI: Angular Material / Bootstrap.
       */
      updateAngularJsonForMaterial(options),
      updateIndexHtmlForMaterial(options),
      options.addSupportBootstrap === 'Y' ? updateAngularJsonForBootstrap(options) : noop(),

      options.enableSonarQube === 'Y' ? updatePackageJsonForSonar() : noop(),
      updatePackageJsonForBuild(options),

      /**
       * Cartelle vuote con .gitkeep.
       */
      scaffoldEmptyFolders(options),

      /**
       * Modulo/config root, routing e componente root (classic o standalone).
       */
      updateAppShell(options),
    ]);
  };
}
