/**
 * @author @l.piciollo
 * @email l.piciollo@accenture.com
 * @create date 2019-12-22 12:09:07
 * @modify date 2019-12-22 12:09:07
 * @desc [interfaccia per la specializzazione di dunzionalita native dei browser 
 * utile per risalire alle funzionalità messe a disposizione dal sistema core e evita che il compilatore vada in errore
 * per funzionalità non trovate.]
 */
 

interface String {
    format: (...params) => string;
    isNullOrEmpty: (val: string) => boolean;
    truncateUrlIfNoParams: (val: any) => string;
    truncateUrlCache: (val: any) => string;
}

interface Array<T> {
    moveDown: (from) => void;
    moveTo: (from, to) => void;
    moveUp: (from) => void;
    delete: (position) => void;
    differences: (items) => Array<any>;
    inArray: (item) => Number;
    insert: (index: number, item: any) => void;
}

interface JSON     { 
    changeValues: (json,previousValue, nextValue) => any;
    changeValuesByKey: (json,key, nextValue) => any;
    findByValue: (json, value) => any;
    json2flat: (json) => any;
    json2array: (json) => any;
    json2flatObj: (json) => any;
    findKey: (json, keyFind) => any;
}




