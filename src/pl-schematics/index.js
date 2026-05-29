"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const checkVersion_1 = require("./checkVersion");
const add_material_module_imports_rule_1 = require("./rules/add-material-module-imports.rule");
const add_package_json_dependencies_rule_1 = require("./rules/add-package-json-dependencies.rule");
const add_root_module_imports_rule_1 = require("./rules/add-root-module-imports.rule");
const add_template_files_rule_1 = require("./rules/add-template-files.rule");
const get_prefix_from_angular_json_rule_1 = require("./rules/get-prefix-from-angular-json.rule");
const install_package_json_dependencies_rule_1 = require("./rules/install-package-json-dependencies.rule");
const log_options_rule_1 = require("./rules/log-options.rule");
const normalize_options_rule_1 = require("./rules/normalize-options.rule");
const scaffold_empty_folders_rule_1 = require("./rules/scaffold-empty-folders.rule");
const update_angular_json_bootstrap_rule_1 = require("./rules/update-angular-json-bootstrap.rule");
const update_angular_json_material_rule_1 = require("./rules/update-angular-json-material.rule");
const update_index_html_material_rule_1 = require("./rules/update-index-html-material.rule");
const update_package_json_rule_1 = require("./rules/update-package-json.rule");
const validate_options_rule_1 = require("./rules/validate-options.rule");
const update_angular_json_environments_rule_1 = require("./rules/update-angular-json-environments.rule");
const add_ngrx_module_imports_rule_1 = require("./rules/add-ngrx-module-imports.rule");
function plSchematics(options) {
    return (0, schematics_1.chain)([
        (0, normalize_options_rule_1.normalizeOptions)(options),
        (0, validate_options_rule_1.validateOptions)(options),
        (0, get_prefix_from_angular_json_rule_1.getPrefixFromAngularJson)(options),
        (0, add_ngrx_module_imports_rule_1.addNgrxModuleImports)(options),
        (0, add_package_json_dependencies_rule_1.addPackageJsonDependencies)(options),
        (0, install_package_json_dependencies_rule_1.installPackageJsonDependencies)(),
        (0, log_options_rule_1.logOptions)(options),
        (0, add_template_files_rule_1.addTemplateFiles)(options),
        (0, update_angular_json_environments_rule_1.updateAngularJsonForEnvironments)(options),
        (0, update_angular_json_material_rule_1.updateAngularJsonForMaterial)(options),
        (0, update_index_html_material_rule_1.updateIndexHtmlForMaterial)(options),
        options.addSupportBootstrap === 'Y'
            ? (0, update_angular_json_bootstrap_rule_1.updateAngularJsonForBootstrap)(options)
            : (0, schematics_1.noop)(),
        options.enableSonarQube === 'Y'
            ? (0, update_package_json_rule_1.updatePackageJsonForSonar)()
            : (0, schematics_1.noop)(),
        (0, update_package_json_rule_1.updatePackageJsonForBuild)(options),
        (0, scaffold_empty_folders_rule_1.scaffoldEmptyFolders)(options),
        (0, add_root_module_imports_rule_1.addRootModuleImports)(options),
        (0, add_material_module_imports_rule_1.addMaterialModuleImports)(options),
        (0, checkVersion_1.check)({
            'pl-core-utils-library': '',
        }),
    ]);
}
exports.default = plSchematics;
