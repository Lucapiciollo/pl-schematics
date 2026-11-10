import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { ensureArray, overwriteJsonFile, readJsonFile } from '../utils/json.utils';
import { getBuildOptions, getProjectObject } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Gli asset generati (i18n, mock) vivono in <sourceRoot>/assets/public/...: i
 * progetti creati da Angular 18+ servono pero' solo la cartella `public/`.
 * Aggiunge a angular.json la voce asset che pubblica <sourceRoot>/assets su /assets,
 * cosi' l'URL usato a runtime (assets/public/i18n/it.json) esiste davvero.
 */
export function updateAngularJsonForAssets(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspaceJson = readJsonFile(host, 'angular.json');

    if (!workspaceJson) {
      return host;
    }

    const project = getProjectObject(workspaceJson, options);
    const buildOptions = getBuildOptions(project);

    if (!buildOptions || !project.architect || !project.architect.build) {
      context.logger.warn('Build options not found: assets entry not added.');
      return host;
    }

    const input = (project.sourceRoot || 'src') + '/assets';
    const assets = ensureArray<any>(project.architect.build.options.assets);
    const present = assets.some(
      (entry: any) => entry && typeof entry === 'object' && entry.input === input,
    );

    if (!present) {
      assets.push({ glob: '**/*', input, output: '/assets' });
      project.architect.build.options.assets = assets;
      overwriteJsonFile(host, 'angular.json', workspaceJson);
      context.logger.info('Added assets entry "' + input + '" into angular.json.');
    }

    return host;
  };
}
