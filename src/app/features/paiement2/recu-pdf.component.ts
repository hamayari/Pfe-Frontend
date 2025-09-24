import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recu-pdf',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './recu-pdf.component.html',
  styleUrls: ['./recu-pdf.component.scss']
})
export class RecuPdfComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}














