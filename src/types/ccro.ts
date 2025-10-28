export type CCROStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'surveying'
  | 'approved'
  | 'rejected'
  | 'completed';

export const STATUS_LABELS: Record<CCROStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  surveying: 'Surveying',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

// Party information shown in the application
export interface PartyInfo {
  id?: string | number;
  name: string;
  idNumber?: string;
  phone?: string;
  verificationStatus: 'verified' | 'unverified';
  role?: string;
  dob?: string; // ISO date
  pictureUrl?: string;
}

// Allocation (ownership/share) for a parcel
export interface Allocation {
  partyId?: string | number;
  partyName?: string;
  // share expressed as percentage (0-100)
  share?: number;
  // human readable description of rights / notes
  rights?: string;
  effectiveFrom?: string; // ISO date
  effectiveTo?: string; // ISO date
}

export interface Signatory {
  name: string;
  designation?: string;
  signatureUrl?: string;
  signedAt?: string; // ISO datetime
}

export interface DocumentMeta {
  id: string | number;
  description?: string;
  fileUrl?: string;
  createdAt?: string;
}

export interface SurveyMetadata {
  surveyor?: string;
  surveyDate?: string;
  notes?: string;
  beaconPoints?: Array<{ name?: string; coordinates?: [number, number] }>;
}

export interface FeeRecord {
  amount: number;
  paid: boolean;
  receiptId?: string;
  paidAt?: string;
}

export interface AuditEntry {
  actor?: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface CCROParcel {
  id?: string | number;
  area?: string | number;
  currentUse?: string;
  proposedUse?: string;
  geom?: any; // GeoJSON
  allocations?: Allocation[];
  documents?: DocumentMeta[];
  survey?: SurveyMetadata;
  fees?: FeeRecord[];
}

export interface CCROApplication {
  id: string;
  claimNo: string;
  status: CCROStatus;
  partyInfo: PartyInfo[];
  locality: {
    village: string;
    hamlet: string;
  };
  parcel: CCROParcel;
  signatories?: Signatory[];
  auditHistory?: AuditEntry[];
  createdAt?: string;
  updatedAt?: string;
}