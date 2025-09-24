export interface Convention {
  id: string;
  reference: string;
  label?: string;
  clientId: string;
  clientName: string;
  governorate: string;
  structure: string;
  application: string;
  amount: number;
  totalAmount?: number;
  currency?: string;
  status: ConventionStatus;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  paymentTerm: PaymentTerm;
  commercialId: string;
  projectManagerId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConventionStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentTerm {
  IMMEDIATE = 'IMMEDIATE',
  THIRTY_DAYS = 'THIRTY_DAYS',
  SIXTY_DAYS = 'SIXTY_DAYS',
  NINETY_DAYS = 'NINETY_DAYS'
}

export interface ConventionFilter {
  status?: ConventionStatus;
  governorate?: string;
  structure?: string;
  application?: string;
  startDate?: Date;
  endDate?: Date;
  commercialId?: string;
  projectManagerId?: string;
}

export interface ConventionFormData {
  reference: string;
  label?: string;
  clientId: string;
  governorate: string;
  structure: string;
  application: string;
  applicationId?: string;
  zoneId?: string;
  structureId?: string;
  amount: number;
  totalAmount?: number;
  currency?: string;
  paymentTerm: PaymentTerm;
  paymentTerms?: string;
  paymentDueDays?: number;
  customPaymentTermDays?: number;
  commercialId: string;
  projectManagerId: string;
  description?: string;
  notes?: string;
  termsAndConditions?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ConventionStatus;
}