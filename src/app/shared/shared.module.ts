import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { TruncatePipe } from './pipes/truncate.pipe';
import { NomenclatureTypePipe } from './pipes/nomenclature-type.pipe';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    TruncatePipe,
    NomenclatureTypePipe
  ],
  exports: [
    CommonModule,
    MaterialModule,
    TruncatePipe,
    NomenclatureTypePipe
  ]
})
export class SharedModule { }


