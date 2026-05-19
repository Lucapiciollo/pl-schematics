// src/pl-schematics/index.ts

import { chain, noop, Rule } from '@angular-devkit/schematics';

import { check } from './checkVersion';
import { addClass } from './rules/add-class.rule';
import { addModuleToImports } from './rules/add-module-to-imports.rule';
import { addPackageJsonDependencies } from './rules/add-package-json-dependencies.rule';
import { getPrefixFromAngularJson } from './rules/get-prefix-from-angular-json.rule';
import { installPackageJsonDependencies } from './rules/install-package-json-dependencies.rule';
import { logOptions } from './rules/log-options.rule';
import { normalizeOptions } from './rules/normalize-options.rule';
import { scaffoldSchematics } from './rules/scaffold-schematics.rule';
import { updateAngularJsonForBootstrap } from './rules/update-angular-json-bootstrap.rule';
import {
  updatePackageJsonForBuild,
  updatePackageJsonForSonar,
} from './rules/update-package-json.rule';
import { PlSchematicsOptions } from './types/schema-options';

export default function plSchematics(options: PlSchematicsOptions): Rule {
  return chain([
    normalizeOptions(options),
    getPrefixFromAngularJson(options),
    addPackageJsonDependencies(options),
    installPackageJsonDependencies(),
    logOptions(options),

    addClass(options, './files/core/service', options.namePackage + '/core/service/'),
    addClass(options, './files/core/initializer', options.namePackage + '/core/initializer/'),
    addClass(options, './files/core/bean', options.namePackage + '/core/bean/'),
    addClass(options, './files/shared/module', options.namePackage + '/shared/module/'),
    addClass(options, './files/core/module', options.namePackage + '/core/module/'),
    addClass(options, './files/core/interceptor', options.namePackage + '/core/interceptor/'),
    addClass(options, './files/shared/utils', options.namePackage + '/shared/utils/'),
    addClass(options, './files/shared/service', options.namePackage + '/shared/service/'),
    addClass(options, './files/shared/component', options.namePackage + '/shared/component/'),
    addClass(options, './files/shared/pipe', options.namePackage + '/shared/pipe/'),
    addClass(options, './files/core/utils', options.namePackage + '/core/utils/'),
    addClass(options, './files/core/type', options.namePackage + '/core/type/'),
    addClass(options, './files/home', options.namePackage + '/component/page/home'),
    addClass(options, './files/component', '/'),
    addClass(options, './files/extension', '/'),
    addClass(options, './files/customInterface', '../'),
    addClass(options, './files/properties', '../environments/'),
    addClass(options, './files/public', '../assets/public'),
    addClass(options, './documentation', '../../pl-schematics/document'),

    options.enableSonarQube === 'Y'
      ? addClass(options, './files/application', '../../')
      : noop(),

    options.addSupportBootstrap === 'Y'
      ? updateAngularJsonForBootstrap(options)
      : noop(),

    options.enableSonarQube === 'Y'
      ? updatePackageJsonForSonar()
      : noop(),

    updatePackageJsonForBuild(options),

    scaffoldSchematics(options, options.namePackage + '/shared/component/footer'),
    scaffoldSchematics(options, options.namePackage + '/shared/component/menu'),
    scaffoldSchematics(options, options.namePackage + '/shared/component/header'),
    scaffoldSchematics(options, options.namePackage + '/component/section/filter'),
    scaffoldSchematics(options, options.namePackage + '/component/section/tab'),
    scaffoldSchematics(options, options.namePackage + '/shared/config'),
    scaffoldSchematics(options, options.namePackage + '/shared/bean'),
    scaffoldSchematics(options, options.namePackage + '/shared/directive'),

    addModuleToImports(
      options,
      (options.prefixClass || '') + 'InitializerModule',
      './' + options.namePackage + '/core/module/initializer.module',
    ),

    addModuleToImports(
      options,
      'SharedModule',
      './' + options.namePackage + '/shared/module/shared.module',
    ),

    addModuleToImports(
      options,
      'AppRoutingModule',
      './app-routing.module',
    ),

    check({
      'pl-core-utils-library': '',
    }),
  ]);
}