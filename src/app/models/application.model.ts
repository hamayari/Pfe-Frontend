export interface Application {
  id: string;
  code: string;
  libelle: string;
  description?: string;
  actif: boolean;
  dateCreation: Date;
  dateModification: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

