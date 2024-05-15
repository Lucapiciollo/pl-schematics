import { Directive, ElementRef, Injector, Input, OnInit, Renderer2, inject } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ErrorBean, ErrorCode } from '@app/cloud/agic/core/bean/error-bean';
import { PlCoreModule } from 'pl-core-utils-library';
import { Unsubscribe } from 'pl-decorator';
import { Subscription, takeUntil, timer } from 'rxjs';
import { CacheImageService } from '@core/service/cahce.image';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[addImage]'
})
@Unsubscribe()
export class AddImage {
  public _file: string | SafeUrl;
  private document: Document = inject(DOCUMENT);

  @Input() set file(file: string | SafeUrl) {
    this._file = file;
    if (this._file)
      this.preview(this._file)
  };
  @Input() classcls: Array<string>;
  public isMobile = false;
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    protected injector: Injector) { }



  /************************************************************************************************************************************************************************ */

  preview(file) {
    try {
      if (file instanceof File) {
        if (FileReader && file) {
          let fr = new FileReader();
          fr.onload = () => {
            let child = this.document.createElement('img');
            child.setAttribute("src", fr.result as any);
            this.classcls?.map(c => {
              child?.classList?.add(c);
            })
            this.elementRef.nativeElement.innerHTML = "";
            this.renderer.appendChild(this.elementRef.nativeElement, child);
          }
          fr.readAsDataURL(file);
        }
      } else {
        let child = this.document.createElement('img');
        child.setAttribute("src", file as any);
        this.classcls?.map(c => {
          child?.classList?.add(c);
        })
        this.elementRef.nativeElement.innerHTML = "";
        this.renderer.appendChild(this.elementRef.nativeElement, child);
      }
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }
}

/************************************************************************************************************************************************************************ */

interface CachedImage {
  url: string;
  blob: Blob;
}

/************************************************************************************************************************************************************************ */

@Directive({
  selector: '[changeImage]'
})

/************************************************************************************************************************************************************************ */

@Unsubscribe()
export class ChangeImage implements OnInit {
  @Input() paths: Array<string>;
  @Input() isFile: Boolean = false;
  @Input() isFooter: Boolean = false;

  private ob: Subscription = new Subscription();
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private cacheImageService: CacheImageService) { }

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
          // this.renderer.setStyle(this.elementRef.nativeElement, "background-image", 'url("' + this.cacheImageService.get(this.getImagePath(file)) + '")');
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
      return '';
    return (element);
  }

}
