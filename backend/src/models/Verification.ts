export interface VerificationStatus {
  id: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  businessVerified: boolean;
  displayNameSubmitted: boolean;
  documentsUploaded: boolean;
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  lastUpdated: string;
}

export const verificationStatuses: VerificationStatus[] = [];