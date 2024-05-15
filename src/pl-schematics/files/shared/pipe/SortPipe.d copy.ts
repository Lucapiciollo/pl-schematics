/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-05-23 11:45:38
 * @modify date 2022-05-23 11:45:38
 * @desc [extends native interface for adding localCompare function]
 */
/**
 * Extend interface Number for declare method localCompare()
 */
interface Number<> {
    localeCompare: (value:number) => number
}

interface Boolean {
    localeCompare: (value:boolean) => number
}
