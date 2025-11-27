export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired';

export interface Visitor {
    id: string;
    name: string;
    phone: string;
    idType: string;
    idNumber: string;
    photoUrl?: string; // For simulation
}

export interface Application {
    id: string;
    applicationDate: string;
    visitDate: string;
    startTime: string;
    duration: number;
    location: string;
    purpose: string;
    maxVisitors: number;
    validDays: number;
    status: ApplicationStatus;
    visitors: Visitor[];
    disclaimer?: string;
}

export interface VerificationLog {
    id: string;
    visitorName: string;
    applicationId: string;
    idNumber: string;
    timestamp: string;
    status: 'Success' | 'Failed';
    message: string;
}