import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateNameFile',
})
export class TruncateNameFilePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    maxLength = 25,
    separator = '...',
  ): string {
    if (!value) {
      return '';
    }

    const fileName = String(value);

    if (fileName.length <= maxLength) {
      return fileName;
    }

    const lastDotIndex = fileName.lastIndexOf('.');
    const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;

    if (!hasExtension) {
      return fileName.substring(0, maxLength) + separator;
    }

    const name = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);

    const allowedNameLength = maxLength - separator.length - extension.length;

    if (allowedNameLength <= 0) {
      return fileName.substring(0, maxLength) + separator;
    }

    return name.substring(0, allowedNameLength) + separator + extension;
  }
}