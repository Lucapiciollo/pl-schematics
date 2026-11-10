import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "truncateNameFile": accorcia il nome di un file troppo lungo mantenendo l'estensione visibile
 * (es. "documento-lungo....pdf"). Uso nei template: {{ nomeFile | truncateNameFile:25 }}
 */
@Pipe({
  standalone: false,
  name: 'truncateNameFile',
})
export class TruncateNameFilePipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Se il nome supera la lunghezza massima lo tronca inserendo il separatore prima dell'estensione;
   * se non c'e' estensione (o non c'e' spazio per il nome) tronca il testo e aggiunge il separatore in coda.
   * @param value      :nome del file
   * @param maxLength  :lunghezza massima consentita (default 25)
   * @param separator  :testo inserito al posto della parte rimossa (default '...')
   * @returns nome file eventualmente troncato; stringa vuota se il valore e' assente
   */
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