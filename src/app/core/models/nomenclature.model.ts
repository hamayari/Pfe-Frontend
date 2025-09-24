export interface Nomenclature {
  id: string;
  name: string;
  label?: string;
  code?: string;
  type: NomenclatureType;
  status: NomenclatureStatus;
  description?: string;
  metadata?: any;
  isActive?: boolean;
  parentId?: string;
  parent?: Nomenclature;
  children?: Nomenclature[];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface NomenclatureFormData {
  name: string;
  label?: string;
  code?: string;
  type: NomenclatureType;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  order?: number;
  metadata?: any;
}

export interface NomenclatureFilter {
  type?: NomenclatureType;
  status?: NomenclatureStatus;
  isActive?: boolean;
  parentId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NomenclatureListResponse {
  data: Nomenclature[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export enum NomenclatureType {
  GOVERNORATE = 'GOVERNORATE',
  STRUCTURE = 'STRUCTURE',
  APPLICATION = 'APPLICATION',
  STATUS = 'STATUS',
  PAYMENT_TERM = 'PAYMENT_TERM'
}

export interface NomenclatureTypeInfo {
  code: string;
  label: string;
}

export enum NomenclatureStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}