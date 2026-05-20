import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import moment from 'moment';
import { LanguageService } from '../../core/service/language.service';
import { FORMAT_LOCAL_DATE_CONFIG } from '../module/shared.module';

@Pipe({
    name: 'localizedDate',
    pure: true
})
export class LocalizedDatePipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) private locale: string, @Inject(LanguageService) private langService) { }
    transform(
        value: Date | string | number,
        format: string = 'shortDate'
    ): string | null {
        const defaultFormat = FORMAT_LOCAL_DATE_CONFIG().formatDateMoment
        if (!value) {
            return null;
        }
        moment.locale(this.langService.currentLanguage().lan);
        return moment((value as string), defaultFormat).format(defaultFormat);
    }
}
