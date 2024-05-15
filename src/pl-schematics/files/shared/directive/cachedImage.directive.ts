import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { PlCoreModule } from 'pl-core-utils-library';
import { Unsubscribe } from 'pl-decorator';
import { Subscription, takeUntil, timer } from 'rxjs';
import { ErrorBean, ErrorCode } from '@core/bean/error-bean';
import { CacheImageService } from '@core/service/cahce.image';

interface CachedImage {
  url: string;
  blob: Blob;
}

@Directive({
  selector: '[changeImage]'
})
@Unsubscribe()
export class ChangeImage implements OnInit {
  @Input() paths: Array<string>;
  @Input() isFile: Boolean = false;
  @Input() isFooter: Boolean = false;

  private ob: Subscription = new Subscription();

  /************************************************************************************************************************************************************************ */

  constructor(private elementRef: ElementRef, private renderer: Renderer2, private cacheImageService: CacheImageService) { }

  /************************************************************************************************************************************************************************ */

  ngOnInit() {
    let position = 0;
    if (this.paths && this.paths.length > 1) {
      this.ob.add(timer(1000, 2000).pipe(takeUntil(PlCoreModule.Routing().getIinterrupt())).subscribe(n => {
        if (position > this.paths.length - 1)
          position = 0
        this.preview(this.paths[position])
        position++;
      }));
    }
    else if (this.paths) {
      this.preview(this.paths[position])
    } else {
      this.preview(null)
    }
  }

  /************************************************************************************************************************************************************************ */

  private downloadImage(file, call: (path) => void) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", this.getImagePath(file));
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.withCredentials = true;
    xhr.responseType = "blob";
    xhr.onload = (response) => {
      this.cacheImageService.put(this.getImagePath(file), (response as any).srcElement.response);
      call(this.getImagePath(file));
    };
    xhr.send();
  }

  /************************************************************************************************************************************************************************ */

  async preview(file: string) {
    try {
      if (this.elementRef.nativeElement.nodeName == "IMG") {
        if (this.cacheImageService.get(this.getImagePath(file)) != null) {
          this.elementRef.nativeElement.src = this.cacheImageService.get(this.getImagePath(file))
        } else {
          this.downloadImage(file, (path) => this.elementRef.nativeElement.src = path)
        }
      }
      else {
        if (this.cacheImageService.get(this.getImagePath(file)) != null) {
          this.renderer.setStyle(this.elementRef.nativeElement, "background-image", 'url("' + this.cacheImageService.get(this.getImagePath(file)) + '")');
        } else {
          this.downloadImage(file, (path) => this.renderer.setStyle(this.elementRef.nativeElement, "background-image", 'url("' + path + '")'));
        }
      }
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }

  /************************************************************************************************************************************************************************ */

  getImagePath(element: string): string {

    if (!element)
      return !this.isFile ? "assets/img/no-image.png" : "assets/img/descripton-title.svg"
    return (element);


  }

}
