/**
 * @author @l.piciollo
 * @email l.piciollo@accenture.com
 * @create date 2021-02-19 17:46:39
 * @modify date 2021-02-19 18:30:37
 * @desc [description]
 */

const path = require('path');

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (value !== null && value !== undefined && typeof value === "object" && typeof value !== "undefined") {
      if (seen.has(value) || typeof value === 'undefined') {
        return;
      }
      seen.add(value);
    }
    return value;
  }
};



class FileListPlugin {

  apply(compiler) {


    /*  console.log(compiler) */

    /*  Object.keys(compiler.hooks).forEach(hock => {
 
       compiler.hooks[hock].tap("FileListPlugin", (compilation) => {
         if (compilation != undefined && compilation != null) {
           try {
             fs.writeFile(path.resolve(__dirname, 'dist/' + hock + ".txt"), JSON.stringify(compilation, getCircularReplacer()), function (err) {
               if (err) {
                 return console.log(err);
               }
             });
           } catch (e) {
             console.log(e)
           };
         }
       })
     })*/
  }
}

module.exports = FileListPlugin;