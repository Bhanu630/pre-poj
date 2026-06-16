// User types
export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'donor' | 'organization';
  avatar?: string;
  createdAt: Date;
}

export interface DonorProfile extends User {
  userType: 'donor';
  skills?: string[];
  availability?: string;
  location?: string;
}

export interface OrganizationProfile extends User {
  userType: 'organization';
  organizationName: string;
  description?: string;
  location?: string;
}

// Requirement types
export interface Requirement {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  requiredSkills?: string[];
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequirementResponse {
  id: string;
  requirementId: string;
  donorId: string;
  organizationId: string;
  proposedDetails: string;
  proposal?: {
    timeline?: string;
    costEstimate?: number;
    additionalInfo?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  submittedAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
}

// Sponsorship types
export interface Sponsorship {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  amount: number;
  beneficiaryType: string;
  slots: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SponsorshipRequest {
  id: string;
  sponsorshipId: string;
  donorId: string;
  organizationId: string;
  beneficiaryInfo: {
    name: string;
    description: string;
    requirements?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  submittedAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
}

// Notification types
export type NotificationType = 
  | 'requirement_response'
  | 'requirement_accepted'
  | 'requirement_rejected'
  | 'requirement_completed'
  | 'sponsorship_request'
  | 'sponsorship_accepted'
  | 'sponsorship_rejected'
  | 'sponsorship_completed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId: string; // requirementId, sponsorshipId, etc.
  isRead: boolean;
  createdAt: Date;
}

// Dashboard stats types
export interface DonorDashboardStats {
  totalResponses: number;
  acceptedResponses: number;
  rejectedResponses: number;
  completedResponses: number;
  sponsorshipRequests: number;
  approvedSponsorship: number;
}

export interface OrganizationDashboardStats {
  totalRequirements: number;
  activeRequirements: number;
  fulfilledRequirements: number;
  pendingResponses: number;
  totalSponsorships: number;
  activeSponsorship: number;
  sponsorshipRequests: number;
}
