import { chain, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { getLibrarySourceRoot } from '../utils/library.utils';
import {
  scaffoldLibrarySchematics,
  scaffoldSchematics,
} from './scaffold-schematics.rule';

export function scaffoldEmptyFolders(options: PlSchematicsOptions): Rule {
  const sharedLibSourceRoot = getLibrarySourceRoot(options.sharedLibName as string);

  return chain([
    /**
     * Cartelle "condivise": vivono dentro la libreria shared, non nel progetto
     * applicativo, cosi' come tutto il resto del contenuto realmente riusabile.
     */
    scaffoldLibrarySchematics(sharedLibSourceRoot + '/component/footer'),
    scaffoldLibrarySchematics(sharedLibSourceRoot + '/component/menu'),
    scaffoldLibrarySchematics(sharedLibSourceRoot + '/component/header'),
    scaffoldLibrarySchematics(sharedLibSourceRoot + '/config'),
    scaffoldLibrarySchematics(sharedLibSourceRoot + '/directive'),

    /**
     * Cartelle applicative (pagine/sezioni specifiche del progetto).
     */
    scaffoldSchematics(options, options.namePackage + '/component/section/filter'),
    scaffoldSchematics(options, options.namePackage + '/component/section/tab'),
  ]);
}