import { chain, noop, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { addClass } from './add-class.rule';

export function addTemplateFiles(options: PlSchematicsOptions): Rule {
    return chain([
        addClass(options, './files/core/service', options.namePackage + '/core/service/'),
        addClass(options, './files/core/initializer', options.namePackage + '/core/initializer/'),
        addClass(options, './files/core/bean', options.namePackage + '/core/bean/'),

        addClass(options, './files/core/module', options.namePackage + '/core/module/'),
        addClass(options, './files/core/interceptor', options.namePackage + '/core/interceptor/'),
        addClass(options, './files/core/utils', options.namePackage + '/core/utils/'),
        addClass(options, './files/core/type', options.namePackage + '/core/type/'),

        addClass(options, './files/shared/module', options.namePackage + '/shared/module/'),
        addClass(options, './files/shared/utils', options.namePackage + '/shared/utils/'),
        addClass(options, './files/shared/service', options.namePackage + '/shared/service/'),
        addClass(options, './files/shared/component', options.namePackage + '/shared/component/'),
        addClass(options, './files/shared/pipe', options.namePackage + '/shared/pipe/'),

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
    ]);
}