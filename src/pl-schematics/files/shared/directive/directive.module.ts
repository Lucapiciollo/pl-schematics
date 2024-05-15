/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-03-29 19:47:50
 * @modify date 2022-03-29 19:47:50
 * @desc [description]
 */

import { NgModule } from "@angular/core";
import { AddImage } from "./addimage.directive";
import { ChangeImage } from "./cachedImage.directive";
import { ScrollableDirective } from "./scroll.directive";

import { SpeechDirective } from "./speech-recognition";
import { Throttle } from "./throttle";


import { DropDirective } from "./drop.directive";

@NgModule({
  declarations: [
    DropDirective,
    AddImage,
    ScrollableDirective,
    Throttle,
    SpeechDirective,
    ChangeImage,

  ],
  imports: [],
  exports: [

    DropDirective,
    ScrollableDirective,
    Throttle,
    SpeechDirective,
    ChangeImage,
    AddImage,

  ]
})
export class DirectiveModule { }
