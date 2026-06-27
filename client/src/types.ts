export interface Member {
  id: number;
  name: string;
  contact: string;
  is_organizer: number;
}

export interface Trip {
  id: number;
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
  participants: { id: number; name: string }[];
}

export interface SummaryMember {
  id: number;
  name: string;
  total: number;
  activities: { name: string; share: number }[];
}

export interface Summary {
  grandTotal: number;
  members: SummaryMember[];
}

export interface MyCosts {
  total: number;
  activities: { name: string; share: number }[];
}

export interface AuthResult {
  memberId: number;
  tripId: number;
  isOrganizer: boolean;
}
