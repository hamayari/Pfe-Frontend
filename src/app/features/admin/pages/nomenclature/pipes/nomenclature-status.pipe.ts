import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nomenclatureStatus',
  standalone: true
})
export class NomenclatureStatusPipe implements PipeTransform {

  transform(value: boolean): string {
    return value ? 'Actif' : 'Inactif';
  }

}














