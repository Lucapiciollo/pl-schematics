import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { ensureArray, overwriteJsonFile, pushIfMissing, readJsonFile } from '../utils/json.utils';
import { getProjectObject } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * pl-core-utils-library importa @ng-bootstrap/ng-bootstrap (NgbModule), che per i testi
 * localizzati richiede @angular/localize: il polyfill `@angular/localize/init`
 * (equivalente di `ng add @angular/localize`) va caricato nei polyfills del build.
 */
export function updateAngularJsonForLocalize(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspaceJson = readJsonFile(host, 'angular.json');

    if (!workspaceJson) {
      return host;
    }

    const project = getProjectObject(workspaceJson, options);
    const build = project.architect && project.architect.build;

    if (!build || !build.options) {
      context.logger.warn('Build options not found: @angular/localize/init polyfill not added.');
      return host;
    }

    const polyfills = ensureArray<string>(build.options.polyfills);

    if (polyfills.indexOf('@angular/localize/init') < 0) {
      pushIfMissing(polyfills, '@angular/localize/init');
      build.options.polyfills = polyfills;
      overwriteJsonFile(host, 'angular.json', workspaceJson);
      context.logger.info('Added @angular/localize/init polyfill into angular.json.');
    }

    return host;
  };
}
