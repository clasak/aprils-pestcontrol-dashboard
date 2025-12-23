/**
 * Compliance Module Types
 * Types for compliance tracking, certifications, and regulatory management
 */

export type ComplianceStatus = 'compliant' | 'warning' | 'expired' | 'pending';
export type CertificationType = 'license' | 'certification' | 'insurance' | 'permit';
export type TrainingCategory = 'safety' | 'chemical' | 'equipment' | 'regulatory' | 'other';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed';

export interface Certification {
  id: string;
  name: string;
  type: CertificationType;
  issuer: string;
  licenseNumber: string;
  employeeId?: string;
  employeeName?: string;
  issuedDate: string;
  expirationDate: string;
  status: ComplianceStatus;
  renewalCost?: number;
  renewalUrl?: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface TrainingRecord {
  id: string;
  courseName: string;
  category: TrainingCategory;
  employeeId: string;
  employeeName: string;
  completedDate: string;
  expirationDate?: string;
  certificationNumber?: string;
  provider: string;
  status: ComplianceStatus;
  hoursCompleted: number;
  hoursRequired: number;
}

export interface ComplianceAudit {
  id: string;
  auditType: string;
  auditor: string;
  scheduledDate: string;
  completedDate?: string;
  status: AuditStatus;
  findings?: string;
  score?: number;
  maxScore?: number;
  nextAuditDate?: string;
}

export interface RegulatoryRequirement {
  id: string;
  regulation: string;
  authority: string;
  category: string;
  description: string;
  dueDate?: string;
  status: ComplianceStatus;
  lastReviewDate: string;
  nextReviewDate: string;
  responsiblePerson: string;
  attachments?: string[];
}

export interface ComplianceAlert {
  id: string;
  type: 'expiration' | 'renewal' | 'audit' | 'violation' | 'training';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  relatedItemId: string;
  relatedItemType: string;
  dueDate?: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

export interface ComplianceMetrics {
  overallComplianceRate: number;
  activeCertifications: number;
  expiringThisMonth: number;
  expiringThisQuarter: number;
  pendingRenewals: number;
  trainingComplianceRate: number;
  upcomingAudits: number;
  openViolations: number;
  totalEmployees: number;
  fullyCompliantEmployees: number;
}

export interface EmployeeComplianceStatus {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  activeLicenses: number;
  requiredLicenses: number;
  completedTrainings: number;
  requiredTrainings: number;
  complianceScore: number;
  nextExpiration?: string;
  status: ComplianceStatus;
}

