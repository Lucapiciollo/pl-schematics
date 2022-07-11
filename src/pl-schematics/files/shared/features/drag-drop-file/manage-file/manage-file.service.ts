import { Injectable } from '@angular/core';
import { PlHttpRequest } from 'pl-core-utils-library';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../../../../../environments/environment';
import { HttpService } from '../../../../core/service/http.service';

@Injectable({
  providedIn: 'root'
})
export class ManageFileService {

  constructor(private httpService: HttpService) { }

  uploadFile(file: File, callBack: (id) => void): Observable<any> {
    return new Observable<any>(obs => {
      let formData: FormData = new FormData();
      formData.append('file', file, file.name);
      let plHttpRequest: PlHttpRequest = new PlHttpRequest(environment.http.api.uploadFile, null, null, formData);
      let postfile:Subscription  = this.httpService.POSTFILE(plHttpRequest, null, callBack, null).subscribe(sb => {
        obs.next(sb);
        obs.complete();
        postfile.unsubscribe();
      }, error => {
        obs.error(error);
      }, () => { })
    })
  }

}
