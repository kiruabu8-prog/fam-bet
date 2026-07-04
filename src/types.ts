export type Language = "en" | "am";

export interface CorrectScoreSelection {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  predictedScore: string;
  actualScore?: string;
  odds: number;
}

export interface BettingTicket {
  id: string;
  title: string;
  date: string;
  selections: CorrectScoreSelection[];
  stake: number;
  totalOdds: number;
  status: "WON" | "PENDING" | "LOST";
  investorsCount: number;
  totalInvested: number;
}

export interface PredictScoreOption {
  score: string;
  probability: number;
  description: string;
}

export interface PredictionResult {
  predictions: PredictScoreOption[];
  analysis: string;
  confidence: number;
  keyInsight: string;
  isDemo?: boolean;
}

export interface InvestmentPlan {
  id: string;
  nameEn: string;
  nameAm: string;
  minInvestment: number;
  expectedRoiPercent: number; // e.g. 150%
  durationDays: number;
  commissionPercent: number; // tipster share
  descriptionEn: string;
  descriptionAm: string;
}

export interface UserProfile {
  id: string; // starts with FB0132...
  displayName: string;
  email: string;
  photoURL?: string;
  isLoggedIn: boolean;
  bankName?: string;
  bankAccountNo?: string;
  bankAccountHolder?: string;
  password?: string;
}

export interface InvestmentOrder {
  orderId: string; // starts with FB0132
  planId: string;
  planName: string;
  amount: number;
  expectedReturn: number;
  status: "PENDING_PAYMENT" | "ACTIVE" | "COMPLETED";
  createdAt: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountHolder: string;
  depositMethod: string;
}

