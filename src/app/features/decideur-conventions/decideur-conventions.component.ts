import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-decideur-conventions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule
  ],
  templateUrl: './decideur-conventions.component.html',
  styleUrls: ['./decideur-conventions.component.scss']
})
export class DecideurConventionsComponent implements OnInit {
  displayedColumns: string[] = ['reference', 'libelle', 'structure', 'gouvernorat', 'montant', 'statut', 'echeance', 'actions'];
  
  conventions = [
    {
      reference: 'CONV-2024-001',
      libelle: 'Convention Formation IT',
      structure: 'Structure A',
      gouvernorat: 'Tunis',
      montant: 45000,
      statut: 'active',
      echeance: new Date('2024-12-15')
    },
    {
      reference: 'CONV-2024-002',
      libelle: 'Convention Maintenance',
      structure: 'Structure B',
      gouvernorat: 'Sfax',
      montant: 32000,
      statut: 'active',
      echeance: new Date('2024-11-20')
    },
    {
      reference: 'CONV-2024-003',
      libelle: 'Convention Support Technique',
      structure: 'Structure C',
      gouvernorat: 'Sousse',
      montant: 28000,
      statut: 'expiree',
      echeance: new Date('2024-10-10')
    }
  ];

  ngOnInit(): void {
    console.log('📄 Conventions Décideur chargées');
  }

  viewDetails(convention: any): void {
    console.log('Voir détails:', convention);
  }

  editConvention(convention: any): void {
    console.log('Modifier:', convention);
  }
}
