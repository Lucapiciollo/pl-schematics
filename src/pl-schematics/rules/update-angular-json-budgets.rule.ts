import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { overwriteJsonFile, readJsonFile } from '../utils/json.utils';
import { getProjectObject } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Il bundle iniziale di un'app che usa pl-core-utils-library (html2canvas,
 * ng-bootstrap, ngx-ui-loader, ...) supera il budget di default di `ng new`
 * (500kB warning / 1MB error) e farebbe fallire `ng build`. Alza i limiti del budget
 * "initial" della configurazione production a 2MB (warning) / 4MB (error).
 */
export function updateAngularJsonForBudgets(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspaceJson = readJsonFile(host, 'angular.json');

    if (!workspaceJson) {
      return host;
    }

    const project = getProjectObject(workspaceJson, options);
    const production =
      project.architect &&
      project.architect.build &&
      project.architect.build.configurations &&
      project.architect.build.configurations.production;

    if (!production || !Array.isArray(production.budgets)) {
      return host;
    }

    let changed = false;

    production.budgets.forEach((budget: any) => {
      if (budget && budget.type === 'initial') {
        if (budget.maximumWarning !== '2MB' || budget.maximumError !== '4MB') {
          budget.maximumWarning = '2MB';
          budget.maximumError = '4MB';
          changed = true;
        }
      }
    });

    if (changed) {
      overwriteJsonFile(host, 'angular.json', workspaceJson);
      context.logger.info('Raised the "initial" bundle budget to 2MB/4MB in angular.json.');
    }

    return host;
  };
}
