

import { strings } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addModuleImportToRootModule, addPackageJsonDependency, buildDefaultPath, getProjectFromWorkspace, getWorkspace, NodeDependency, NodeDependencyType } from 'schematics-utilities';
import { check } from "./checkVersion"

/******************************************************************************************************************** */
function addPackageJsonDependencies(options: any): Rule {
  return (host: Tree, context: SchematicContext) => {
    const dependencies: NodeDependency[] = [
      { type: NodeDependencyType.Default, version: 'latest', name: String("pl-core-utils-library") },
      { type: NodeDependencyType.Default, version: '^5.15.1', name: String("@fortawesome/fontawesome-free") },
      { type: NodeDependencyType.Default, version: '^4.0.0', name: String("@ngx-translate/http-loader") },
      { type: NodeDependencyType.Default, version: '11.0.1', name: String("@ngx-translate/core") },
      { type: NodeDependencyType.Default, version: '^10.0.0', name: String("ngx-ui-loader") },
      { type: NodeDependencyType.Default, version: '^2.9.4', name: String("chart.js") },
      { type: NodeDependencyType.Default, version: '^1.1.11', name: String("@compodoc/compodoc") },
      { type: NodeDependencyType.Default, version: '^12.0.0', name: String("@angular-builders/custom-webpack") },
/*       { type: NodeDependencyType.Default, version: 'latest', name: String("@angular/compiler") },
      { type: NodeDependencyType.Default, version: 'latest', name: String("@angular/compiler-cli") }, */
      { type: NodeDependencyType.Default, version: '^0.5.7', name: String("chartjs-plugin-annotation") },
      { type: NodeDependencyType.Default, version: '^5.3.1', name: String("html-webpack-plugin") },
      { type: NodeDependencyType.Default, version: '^1.0.6', name: String("replace-in-file-webpack-plugin") },
      { type: NodeDependencyType.Default, version: '^3.0.0', name: String("@microsoft/microsoft-graph-client") },
      { type: NodeDependencyType.Default, version: '^1.11.0', name: String("@microsoft/teams-js") },
      
    ];
    if (options.addSupportBootstrap == "Y") {
      dependencies.push({ type: NodeDependencyType.Default, version: 'latest', name: String("popper.js") }); 
	    dependencies.push({ type: NodeDependencyType.Default, version: 'latest', name: String("@popperjs/core") }); 
      dependencies.push({ type: NodeDependencyType.Default, version: '^3.4.0', name: String("jquery") });
      dependencies.push({ type: NodeDependencyType.Default, version: '^5.0.0', name: String("bootstrap") });
    }
    if (options.loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {
      dependencies.push({ type: NodeDependencyType.Default, version: '1.0.0', name: String("@azure/msal-angular") });
      dependencies.push({ type: NodeDependencyType.Default, version: '1.3.2', name: String("msal") });
    }
    if (options.enableSonarQube == "Y") {
      dependencies.push({ type: NodeDependencyType.Default, version: '^3.1.0', name: String("sonar-scanner") });
    }
    dependencies.forEach(dependency => {
      addPackageJsonDependency(host, dependency);
      context.logger.log('info', `Library inserted:  "${dependency.name}" into ${dependency.type}`);
    });
    return host;
  };
}
/******************************************************************************************************************** */
function installPackageJsonDependencies(): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    context.logger.log('info', `package install in action.... `);
    return host
  };
}
/******************************************************************************************************************** */
function addModuleToImports(options: any, moduleName: any, libName: any): Rule {
  return (host: Tree, context: SchematicContext) => {
    const angularJsonFile = host.read('angular.json');
    if (angularJsonFile) {
      const workspace = getWorkspace(host);
      const angularJsonFileObject = JSON.parse(angularJsonFile.toString());
      const project = getProjectFromWorkspace(workspace, options.project || angularJsonFileObject.defaultProject);
      addModuleImportToRootModule(host, moduleName, libName, (project as any));
      context.logger.log('info', `Insert: "${moduleName}" in module... `);
    }
    return host;
  };
}
/******************************************************************************************************************** */
function addClass(options: any, urlFile: string, destPath: string) {
  return (host: Tree, context: SchematicContext) => {
    const angularJsonFile = host.read('angular.json');
    if (angularJsonFile) {
      const angularJsonFileObject = JSON.parse(angularJsonFile.toString());
      const project = options.project || angularJsonFileObject.defaultProject
      options.project = angularJsonFileObject.defaultProject;
      const projectObject = angularJsonFileObject.projects[project];
      const defaultPath = buildDefaultPath(projectObject)
      const sourceTemplate = url(urlFile);
      const suorce = apply(sourceTemplate, [
        template({ ...options, ...strings }),
        move(defaultPath + "/" + destPath)
      ])
      context.logger.log('info', `Class created.. : "${urlFile}"`);
      return mergeWith(suorce);
    }
    return host
  }
};
/******************************************************************************************************************** */
function scaffoldSchematics(options: any, destPath: string): Rule {
  return (host: Tree, _context: SchematicContext) => {
    const angularJsonFile = host.read('angular.json');
    if (angularJsonFile) {
      const angularJsonFileObject = JSON.parse(angularJsonFile.toString());
      const project = options.project || angularJsonFileObject.defaultProject
      const projectObject = angularJsonFileObject.projects[project];
      const defaultPath = buildDefaultPath(projectObject)
      _context.logger.log('info', `Created empty folder: "${defaultPath + "/" + destPath + '/.gitkeep'}"`);
      return host.create(defaultPath + "/" + destPath + '/.gitkeep', '');
    }
    return host;
  };
};

/******************************************************************************************************************** */
function updateAngularJsonForBootstrap(): Rule {
  return (host: Tree, context: SchematicContext) => {
    const angularJsonFile = host.read('angular.json');
    if (angularJsonFile) {
       var json = JSON.parse(angularJsonFile.toString());
      //json['projects'][json.defaultProject]['architect']['build']["builder"] = "@angular-builders/custom-webpack:browser";
      //json['projects'][json.defaultProject]['architect']['serve']["builder"] = "@angular-builders/custom-webpack:dev-server";
      var optionsJson = json['projects'][json.defaultProject]['architect']['build']['options'];
      optionsJson['scripts'].indexOf("node_modules/jquery/dist/jquery.slim.min.js") < 0 ? optionsJson['scripts'].push("node_modules/jquery/dist/jquery.slim.min.js") : null;
      optionsJson['scripts'].indexOf("node_modules/popper.js/dist/umd/popper.min.js") < 0 ? optionsJson['scripts'].push("node_modules/popper.js/dist/umd/popper.min.js") : null;
      optionsJson['scripts'].indexOf("node_modules/bootstrap/dist/js/bootstrap.min.js") < 0 ? optionsJson['scripts'].push("node_modules/bootstrap/dist/js/bootstrap.min.js") : null;
      optionsJson['styles'].indexOf("node_modules/bootstrap/dist/css/bootstrap.min.css") < 0 ? optionsJson['styles'].push("node_modules/bootstrap/dist/css/bootstrap.min.css") : null;
      optionsJson['styles'].indexOf("node_modules/@fortawesome/fontawesome-free/css/all.min.css") < 0 ? optionsJson['styles'].push("node_modules/@fortawesome/fontawesome-free/css/all.min.css") : null;
      //optionsJson["customWebpackConfig"] = { "path": "node_modules/pl-schematics/extra-webpack.config.js", "replaceDuplicatePlugins": true, "mergeRules": { "externals": "replace" } };
      /*  optionsJson["indexTransform"] = "" ;  */
      json['projects'][json.defaultProject]['architect']['build']['options'] = optionsJson;
      host.overwrite('angular.json', JSON.stringify(json, null, 2));
    }
    context.logger.log('info', `Added support bootstrap and webpack"`);
    return host;
  }
}
/******************************************************************************************************************** */
function getPrefixFromAngularJson(options: any): Rule {
  return (host: Tree, context: SchematicContext) => {
    const angularJsonFile = host.read('angular.json');
    if (angularJsonFile) {
      var json = JSON.parse(angularJsonFile.toString());
      options.prefix = json['projects'][json.defaultProject]['prefix'];
      context.logger.log('info', `finding prefix: "${options.prefix}`);
    }
    return host;
  }
}

/******************************************************************************************************************** */
function updatePackageJsonForSonar(): Rule {
  return (host: Tree, context: SchematicContext) => {
    const angularJsonFile = host.read('package.json');
    if (angularJsonFile) {
      var json = JSON.parse(angularJsonFile.toString());
      json['scripts']['sonar'] = "sonar-scanner";
      host.overwrite('package.json', JSON.stringify(json, null, 2));
    }
    context.logger.log('info', `added support npm run sonar in package.json.."`);
    return host;
  }
}
/******************************************************************************************************************** */
function updatePackageJsonForBuild(option: any): Rule {
  return (host: Tree, context: SchematicContext) => {
    const angularJsonFile = host.read('package.json');
    if (angularJsonFile) {
      var json = JSON.parse(angularJsonFile.toString());
      delete json['scripts']['build'];
      json['scripts']['build-dev'] = "ng build";
      json['scripts']['build-prod'] = "ng build  --lazyModules --aot  --prod --source-map=false";
      json['scripts']['typedoc'] = "compodoc -d  pl-schematics/document/schematics  -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage";
      json['author'] = option.nameCompany + " template by @l.piciollo";
      json['description'] = option.nameCompany + " project for client";
      host.overwrite('package.json', JSON.stringify(json, null, 2));
    }
    context.logger.log('info', `added support npm run sonar in package.json.."`);
    return host;
  }
}

// export function myComponent(options: any): Rule {
//   return (tree: Tree, _context: SchematicContext) => {
//     const content: Buffer | null = tree.read("./menu.component.html");
//     let strContent: string = '';
//     if(content) strContent = content.toString();

//     const appendIndex = strContent.indexOf('</ul>');
//     const content2Append = '    <li><a href="/contact">contact</a></li> \n';
//     const updatedContent = strContent.slice(0, appendIndex) + content2Append + strContent.slice(appendIndex);

//     tree.overwrite("./menu.component.html", updatedContent);
//     return tree;
//   };
// }

/******************************************************************************************************************** */
export default function (options: any): Rule {
  return chain([
    getPrefixFromAngularJson(options),
    addPackageJsonDependencies(options),
    installPackageJsonDependencies(),
    () => { console.log(options) },
    addClass(options, "./files/core/service", options.namePackage + "/core/service/"),
    addClass(options, "./files/core/initializer", options.namePackage + "/core/initializer/"),
    addClass(options, "./files/core/bean", options.namePackage + "/core/bean/"),
    addClass(options, "./files/shared/module", options.namePackage + "/shared/module/"),
    addClass(options, "./files/core/module", options.namePackage + "/core/module/"),
    addClass(options, "./files/core/interceptor", options.namePackage + "/core/interceptor/"),
    addClass(options, "./files/shared/utils", options.namePackage + "/shared/utils/"),
    addClass(options, "./files/shared/service", options.namePackage + "/shared/service/"),
    addClass(options, "./files/shared/component", options.namePackage + "/shared/component/"),
    addClass(options, "./files/shared/pipe", options.namePackage + "/shared/pipe/"),
    addClass(options, "./files/core/utils", options.namePackage + "/core/utils/"),
    addClass(options, "./files/core/type", options.namePackage + "/core/type/"),
    addClass(options, "./files/home", options.namePackage + "/component/page/home"),
    addClass(options, "./files/component", "/"),
    addClass(options, "./files/extension", "/"),
    addClass(options, "./files/customInterface", "../"),
    addClass(options, "./files/properties", "../environments/"),
    addClass(options, "./files/public", "../assets/public"),
    addClass(options, "./documentation", "../../pl-schematics/document"),
    options && options.enableSonarQube == "Y" ? addClass(options, "./files/application", "../../") : () => { },
    options && options.addSupportBootstrap == "Y" ? updateAngularJsonForBootstrap() : () => { },
    options && options.enableSonarQube == "Y" ? updatePackageJsonForSonar() : () => { },
    updatePackageJsonForBuild(options),
    scaffoldSchematics(options, options.namePackage + "/shared/component/footer"),
    scaffoldSchematics(options, options.namePackage + "/shared/component/menu"),
    scaffoldSchematics(options, options.namePackage + "/shared/component/header"),
    scaffoldSchematics(options, options.namePackage + "/component/section/filter"),
    scaffoldSchematics(options, options.namePackage + "/component/section/tab"),
    scaffoldSchematics(options, options.namePackage + "/shared/config"),
    scaffoldSchematics(options, options.namePackage + "/shared/bean"),
/*     scaffoldSchematics(options, options.namePackage + "/shared/pipe"), */
    scaffoldSchematics(options, options.namePackage + "/shared/directive"),
    addModuleToImports(options, options.prefixClass + "InitializerModule", "./" + options.namePackage + "/core/module/initializer.module"),
    addModuleToImports(options, "SharedModule", "./" + options.namePackage + "/shared/module/shared.module"),
    addModuleToImports(options, "AppRoutingModule", "./app-routing.module"),
    check({  "pl-core-utils-library": "" }),

  ]);
}
