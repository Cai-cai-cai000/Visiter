export type Visitor = {
    id: string;
    name: string;
    phone: string;
    idType: 'id-card' | 'passport' | 'other';
    idNumber: string;
    photoUrl?: string;
};

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type Application = {
    id: string;
    visitDate: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    location: string;
    duration: number; // hours
    purpose: string;
    maxVisitors: number;
    validDays: number;
    disclaimer: string;
    visitors: Visitor[];
    status: ApplicationStatus;
    createdAt: string;
    rejectionReason?: string;
    aiRiskAnalysis?: string; // Analysis from Gemini
};

export type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'expired';
