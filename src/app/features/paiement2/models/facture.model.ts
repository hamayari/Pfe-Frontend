export interface Facture {
  id: string;
  reference: string;
  structure: string;
  montant: number;
  statut: 'PAYÉE' | 'NON PAYÉE' | 'EN ATTENTE' | 'PARTIELLEMENT PAYÉE';
  echeance: string;
  preuveDisponible: boolean;
  dateCreation?: string;
  datePaiement?: string;
  commentaires?: string;
}














































