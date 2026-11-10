/**
 * @author l.piciollo
 * Rule della chain di index.ts: viene eseguita dopo le librerie shared/ngrx e prima
 * degli aggiornamenti di angular.json. Copia nel progetto applicativo i template
 * (core, home, environment, asset, CI, mock-api, ...) in base all'architettura
 * rilevata e alle opzioni scelte.
 */

import { chain, noop, Rule } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import { addClass } from './add-class.rule';

/**
 * @author l.piciollo
 * Voce del manifest dei template: cartella sorgente, destinazione e condizione di attivazione.
 */
interface TemplateFolderConfig {
  /** Cartella dei template, relativa alla cartella dello schematic (es. './files/core/service'). */
  source: string;
  /** Destinazione relativa al percorso di default del progetto; '<namePackage>' viene sostituito. */
  destination: string;
  /** Condizione opzionale: se restituisce false la voce viene saltata. */
  enabled?: (options: PlSchematicsOptions) => boolean;
}

/**
 * @author l.piciollo
 * Predicato: l'app target usa l'architettura classic (NgModule).
 * @param options  :opzioni normalizzate (campo standalone)
 * @returns true se l'app non e' standalone
 */
const isClassic = (options: PlSchematicsOptions): boolean => !options.standalone;

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Predicato: l'app target usa l'architettura standalone.
 * @param options  :opzioni normalizzate (campo standalone)
 * @returns true se l'app e' standalone
 */
const isStandalone = (options: PlSchematicsOptions): boolean => !!options.standalone;

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Predicato: il login Azure Active Directory e' abilitato.
 * @param options  :opzioni normalizzate (campo loginSupportConfiguration)
 * @returns true se e' stato scelto AZURE-ACTIVE-DIRECT
 */
const hasAzure = (options: PlSchematicsOptions): boolean =>
  options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT';

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Template copiati nel progetto applicativo. Il contenuto realmente condiviso
 * (pipe, bean, interceptor, logging, material, ngrx) e' generato come libreria
 * Angular da addSharedLibrary()/addNgrxLibrary(); i file di "shell" dell'app
 * (app.module/app.config, routing, componente root) sono gestiti da
 * updateAppShell(), che li adatta ai nomi reali del progetto (Angular 19 vs 20+).
 * Le cartelle specifiche di un'architettura sono generate solo per quella.
 */
const TEMPLATE_FOLDERS: TemplateFolderConfig[] = [
  { source: './files/core/service', destination: '<namePackage>/core/service/' },
  { source: './files/core/initializer', destination: '<namePackage>/core/initializer/' },
  { source: './files/core/module', destination: '<namePackage>/core/module/', enabled: isClassic },
  { source: './files/core/standalone', destination: '<namePackage>/core/', enabled: isStandalone },
  { source: './files/core/msal', destination: '<namePackage>/core/msal/', enabled: hasAzure },
  {
    source: './files/core/msal-classic',
    destination: '<namePackage>/core/msal/',
    enabled: (options) => hasAzure(options) && isClassic(options),
  },
  { source: './files/core/utils', destination: '<namePackage>/core/utils/' },
  { source: './files/core/type', destination: '<namePackage>/core/type/' },

  { source: './files/home', destination: '<namePackage>/component/page/home' },
  {
    source: './files/home-classic',
    destination: '<namePackage>/component/page/home',
    enabled: isClassic,
  },
  { source: './files/properties', destination: '../environments/' },
  { source: './files/public', destination: '../assets/public' },

  {
    source: './files/application',
    destination: '../../',
    enabled: (options) => options.enableSonarQube === 'Y',
  },
  {
    source: './documentation',
    destination: '../../pl-schematics/document',
    enabled: (options) => options.includeDocumentation === true,
  },
  {
    source: './files/mock-api-node',
    destination: '../../mock-api',
    enabled: (options) => options.mockApi === 'node-express',
  },
  {
    source: './files/ci-azure-devops',
    destination: '../../',
    enabled: (options) => options.ci === 'azure-devops',
  },
  {
    source: './files/ci-github-actions',
    destination: '../../',
    enabled: (options) => options.ci === 'github-actions',
  },

  /**
   * Tool di controllo dipendenze (postinstall). Si disattiva con PL_DEPS_CHECK=false.
   */
  { source: './files/dependency-updater', destination: '../../' },
];

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Sostituisce il segnaposto '<namePackage>' nel percorso di destinazione.
 * @param destination  :percorso di destinazione del manifest (puo' contenere '<namePackage>')
 * @param options      :opzioni normalizzate (campo namePackage)
 * @returns percorso di destinazione con il nome del package reale
 */
function resolveDestination(destination: string, options: PlSchematicsOptions): string {
  return destination.replace('<namePackage>', options.namePackage);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Rule che copia nel progetto tutte le cartelle di template abilitate del manifest
 * TEMPLATE_FOLDERS, in ordine, saltando quelle la cui condizione 'enabled' e' falsa.
 * @param options  :opzioni normalizzate usate per valutare le condizioni e come contesto dei template
 * @returns Rule composta (chain) di una addClass per ogni voce abilitata
 */
export function addTemplateFiles(options: PlSchematicsOptions): Rule {
  return chain(
    TEMPLATE_FOLDERS.map((item: TemplateFolderConfig): Rule => {
      if (item.enabled && !item.enabled(options)) {
        return noop();
      }

      return addClass(options, item.source, resolveDestination(item.destination, options));
    }),
  );
}
