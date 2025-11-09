export interface Convention {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  documents?: string[];
  terms?: string;
  conditions?: string;
  // Additional properties used in commercial dashboard
  structureId?: string;
  zoneGeographiqueId?: string;
  reference?: string;
  paymentTerms?: any;
  echeances?: any[];
  dueDate?: Date;
  createdBy?: string;
  commercial?: string; // Nom du commercial qui a créé la convention
}
