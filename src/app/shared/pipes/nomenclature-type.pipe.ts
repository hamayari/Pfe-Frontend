import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nomenclatureType',
  standalone: true
})
export class NomenclatureTypePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    const typeMap: { [key: string]: string } = {
      'APPLICATION': 'Application',
      'STRUCTURE': 'Structure',
      'ZONE': 'Zone',
      'GOUVERNORAT': 'Gouvernorat',
      'REGION': 'Région',
      'PROVINCE': 'Province',
      'COMMUNE': 'Commune',
      'SERVICE': 'Service',
      'DEPARTMENT': 'Département',
      'DIRECTION': 'Direction'
    };
    
    return typeMap[value.toUpperCase()] || value;
  }
}












