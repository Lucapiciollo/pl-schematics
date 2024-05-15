/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-03-29 19:47:50
 * @modify date 2022-03-29 19:47:50
 * @desc [description]
 */

import { NgModule } from "@angular/core";
import { AddImage } from "./addimage.directive";
import { AppHeightDirective, AutosizeDirective } from "./autosize";
import { ChangeImage } from "./cachedImage.directive";
import { ScrollableDirective } from "./scroll.directive";
import { ScrollListDirective } from "./scroll.list.directive";
import { SpeechDirective } from "./speech-recognition";
import { Throttle } from "./throttle";
import { HidecolumnDirective } from "./hideColumn.directive";
import { ContainerCalendarDirectve, CalendarDirectve } from "./remove-month-directive";
import { DropDirective } from "./drop.directive";

@NgModule({
  declarations: [
    DropDirective,
    CalendarDirectve,
    ContainerCalendarDirectve,
    AppHeightDirective,
    ScrollableDirective,
    Throttle,
    SpeechDirective,
    AutosizeDirective,
    ChangeImage,
    AddImage,
    ScrollListDirective,
    HidecolumnDirective
  ],
  imports: [],
  exports: [
    CalendarDirectve,
    ContainerCalendarDirectve,
    DropDirective,
    AppHeightDirective,
    ChangeImage,
    ScrollableDirective,
    Throttle,
    SpeechDirective,
    AutosizeDirective,
    ChangeImage,
    AddImage,
    ScrollListDirective,
    HidecolumnDirective
  ]
})
export class DirectiveModule { }
