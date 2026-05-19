import { chain, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { scaffoldSchematics } from './scaffold-schematics.rule';

export function scaffoldEmptyFolders(options: PlSchematicsOptions): Rule {
  return chain([
    scaffoldSchematics(options, options.namePackage + '/shared/component/footer'),
    scaffoldSchematics(options, options.namePackage + '/shared/component/menu'),
    scaffoldSchematics(options, options.namePackage + '/shared/component/header'),
    scaffoldSchematics(options, options.namePackage + '/component/section/filter'),
    scaffoldSchematics(options, options.namePackage + '/component/section/tab'),
    scaffoldSchematics(options, options.namePackage + '/shared/config'),
    scaffoldSchematics(options, options.namePackage + '/shared/bean'),
    scaffoldSchematics(options, options.namePackage + '/shared/directive'),
  ]);
}