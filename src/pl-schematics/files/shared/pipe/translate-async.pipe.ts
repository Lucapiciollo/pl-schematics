import { Inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

@Pipe({
  standalone: false,
  name: 'translateAsync',
})
export class TranslateAsyncPipe implements PipeTransform {
  constructor( @Inject(TranslateService) private readonly translateService: TranslateService) {}

  transform(
    key: string | null | undefined,
    params?: Record<string, unknown>,
  ): Observable<string> {
    if (!key) {
      return of('');
    }

    return this.translateService.get(key, params);
  }
}