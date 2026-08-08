export interface Member {
  id: number;
  name: string;
  contact: string;
  is_organizer: number;
}

export interface Trip {
  id: number;
  code: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  currency: string;
  members: Member[];
}

export interface Activity {
  id: number;
  name: string;
  total_amount: number;
  payer_id: number | null;
  payer_name: string | null;
  participants: { id: number; name: string }[];
}

export interface SummaryMember {
  id: number;
  name: string;
  total: number;
  activities: { name: string; share: number; payer_name: string }[];
}

export interface Summary {
  grandTotal: number;
  members: SummaryMember[];
}

export interface MyCosts {
  total: number;
  activities: { name: string; share: number; payer_name: string }[];
}

export interface UserSession {
  userId: number;
  name: string;
  contact: string;
}

export interface AuthResult {
  memberId: number;
  tripId: number;
  tripCode: string;
  isOrganizer: boolean;
}
