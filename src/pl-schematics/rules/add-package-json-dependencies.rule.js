"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_utilities_1 = require("schematics-utilities");
function addPackageJsonDependencies(options) {
    return (host, context) => {
        const dependencies = [
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "pl-core-utils-library",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^5.15.1",
                name: "@fortawesome/fontawesome-free",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^4.0.0",
                name: "@ngx-translate/http-loader",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "11.0.1",
                name: "@ngx-translate/core",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^10.0.0",
                name: "ngx-ui-loader",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^2.9.4",
                name: "chart.js",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^1.1.11",
                name: "@compodoc/compodoc",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^12.0.0",
                name: "@angular-builders/custom-webpack",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^0.5.7",
                name: "chartjs-plugin-annotation",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^5.3.1",
                name: "html-webpack-plugin",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^1.0.6",
                name: "replace-in-file-webpack-plugin",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^3.0.0",
                name: "@microsoft/microsoft-graph-client",
            },
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^1.11.0",
                name: "@microsoft/teams-js",
            },
        ];
        if (options.ui === "material") {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@angular/material",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@angular/cdk",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@angular/animations",
            });
        }
        if (options.state === "ngrx") {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@ngrx/store",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@ngrx/effects",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@ngrx/entity",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@ngrx/store-devtools",
            });
        }
        if (options.addSupportBootstrap === "Y") {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "popper.js",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "latest",
                name: "@popperjs/core",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^3.4.0",
                name: "jquery",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^5.0.0",
                name: "bootstrap",
            });
        }
        if (options.loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "1.0.0",
                name: "@azure/msal-angular",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "1.3.2",
                name: "msal",
            });
        }
        if (options.enableSonarQube === "Y") {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: "^3.1.0",
                name: "sonar-scanner",
            });
        }
        if (options.mockApi === "node-express") {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: "^4.18.2",
                name: "express",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: "^1.7.0",
                name: "cors",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: "^5.0.0",
                name: "ts-node",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: "^10.9.2",
                name: "ts-node-dev",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: "^4.17.21",
                name: "@types/express",
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: "^2.8.17",
                name: "@types/cors",
            });
        }
        dependencies.forEach((dependency) => {
            schematics_utilities_1.addPackageJsonDependency(host, dependency);
            context.logger.info('Library inserted: "' + dependency.name + '" into ' + dependency.type);
        });
        return host;
    };
}
exports.addPackageJsonDependencies = addPackageJsonDependencies;
