export interface ZoneGeographique {
  id: string;
  code: string;
  libelle: string;
  description?: string;
  gouvernement: string;
  actif: boolean;
  dateCreation: Date;
  dateModification: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

