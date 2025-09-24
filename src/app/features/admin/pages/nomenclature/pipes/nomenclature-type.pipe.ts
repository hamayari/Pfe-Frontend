import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nomenclatureType',
  standalone: true
})
export class NomenclatureTypePipe implements PipeTransform {

  transform(value: string): string {
    switch (value?.toLowerCase()) {
      case 'application': return 'Application';
      case 'structure': return 'Structure';
      case 'zone': return 'Zone Géographique';
      default: return value || 'Inconnu';
    }
  }

}














