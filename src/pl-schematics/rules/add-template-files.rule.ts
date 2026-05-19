import { chain, noop, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { addClass } from './add-class.rule';

interface TemplateFolderConfig {
    source: string;
    destination: string;
    enabled?: (options: PlSchematicsOptions) => boolean;
}

const TEMPLATE_FOLDERS: TemplateFolderConfig[] = [
    {
        source: './files/core/service',
        destination: '<namePackage>/core/service/',
    },
    {
        source: './files/core/initializer',
        destination: '<namePackage>/core/initializer/',
    },
    {
        source: './files/core/bean',
        destination: '<namePackage>/core/bean/',
    },
    {
        source: './files/core/module',
        destination: '<namePackage>/core/module/',
    },
    {
        source: './files/core/interceptor',
        destination: '<namePackage>/core/interceptor/',
    },
    {
        source: './files/core/utils',
        destination: '<namePackage>/core/utils/',
    },
    {
        source: './files/core/type',
        destination: '<namePackage>/core/type/',
    },

    {
        source: './files/shared/module',
        destination: '<namePackage>/shared/module/',
    },
    {
        source: './files/shared/utils',
        destination: '<namePackage>/shared/utils/',
    },
    {
        source: './files/shared/service',
        destination: '<namePackage>/shared/service/',
    },
    {
        source: './files/shared/component',
        destination: '<namePackage>/shared/component/',
    },
    {
        source: './files/shared/pipe',
        destination: '<namePackage>/shared/pipe/',
    },

    {
        source: './files/home',
        destination: '<namePackage>/component/page/home',
    },
    {
        source: './files/component',
        destination: '/',
    },
    {
        source: './files/extension',
        destination: '/',
    },
    {
        source: './files/customInterface',
        destination: '../',
    },
    {
        source: './files/properties',
        destination: '../environments/',
    },
    {
        source: './files/public',
        destination: '../assets/public',
    },
    {
        source: './documentation',
        destination: '../../pl-schematics/document',
        enabled: function (options: PlSchematicsOptions): boolean {
            return options.includeDocumentation === true;
        }
    },
    {
        source: './files/mock-api-node',
        destination: '../mock-api',
        enabled: function (options: PlSchematicsOptions): boolean {
            return options.mockApi === 'node-express';
        },
    },
    {
        source: './files/application',
        destination: '../../',
        enabled: options => options.enableSonarQube === 'Y',
    },

];

function resolveDestination(
    destination: string,
    options: PlSchematicsOptions,
): string {
    return destination.replace('<namePackage>', options.namePackage);
}

export function addTemplateFiles(options: PlSchematicsOptions): Rule {
    const rules = TEMPLATE_FOLDERS.map((item: TemplateFolderConfig) => {
        if (item.enabled && !item.enabled(options)) {
            return noop();
        }

        return addClass(
            options,
            item.source,
            resolveDestination(item.destination, options),
        );
    });

    return chain(rules);
}