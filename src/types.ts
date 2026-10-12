export type CategoryId =
  | "school"
  | "social-services"
  | "child-rights"
  | "family-disputes"
  | "daily-life";

export interface CategoryInfo {
  id: CategoryId;
  titleArabic: string;
  titleSwedish: string;
  descriptionArabic: string;
  iconName: string;
  accentColor: string;
  bgLight: string;
}

export interface SwedishTerm {
  term: string;
  arabic: string;
  pronunciation?: string;
  description: string;
  category?: CategoryId;
  exampleInSwedish?: string;
  exampleInArabic?: string;
}

export interface OfficialAuthority {
  nameSwedish: string;
  nameArabic: string;
  description: string;
  contactNumber?: string;
  website?: string;
  openingHours?: string;
  whenToContact: string;
  urgency: "emergency" | "urgent" | "routine";
}

export interface KnowledgeArticle {
  id: string;
  categoryId: CategoryId;
  titleArabic: string;
  titleSwedish: string;
  summary: string;
  detailedPoints: string[];
  practicalSteps: string[];
  keySwedishTerms: SwedishTerm[];
  officialSources: { name: string; url?: string }[];
  commonMisconceptions?: { myth: string; fact: string }[];
}

export interface AIAnswer {
  summary: string;
  steps: string[];
  swedishTerms: { term: string; arabic: string; note: string }[];
  authorities: { name: string; role: string; contact: string }[];
  disclaimer: string;
}

export interface QuestionRecord {
  id: string;
  timestamp: string;
  category: CategoryId;
  question: string;
  answer?: AIAnswer;
  isLoading?: boolean;
}

export type PodcastDuration = "1min" | "3min" | "5min";
export type PodcastTone = "مطمئنة" | "توعوية" | "عملية";

export interface PodcastTurn {
  speaker: string;
  role: "host" | "guest";
  text: string;
}

export interface PodcastGenerationResult {
  title: string;
  guestName: string;
  duration: PodcastDuration;
  tone: PodcastTone;
  turns: PodcastTurn[];
  fullText: string;
  summary: string;
  actionCall: string;
  reelsVersion: {
    hook: string;
    turns: PodcastTurn[];
    closing: string;
    fullText: string;
  };
  disclaimer: string;
}

export interface FAQItem {
  id: string;
  category: CategoryId;
  questionArabic: string;
  questionSwedish?: string;
  answerSummary: string;
  detailedPoints: string[];
  practicalAdvice: string;
  swedishTerms?: { term: string; arabic: string }[];
  tags: string[];
}

export interface BudgetSavingTip {
  id: string;
  category: string;
  titleArabic: string;
  titleSwedish: string;
  descriptionArabic: string;
  estimatedSavingSEK: number;
  difficulty: "easy" | "medium" | "advanced";
  sourceName?: string;
  swedishTerm?: string;
}

export interface FamilyBudgetState {
  adultsCount: number;
  childrenCount: number;
  cityType: "large" | "medium" | "small";
  incomes: {
    salary1: number;
    salary2: number;
    barnbidrag: number;
    bostadsbidrag: number;
    etableringOrCSN: number;
    otherIncome: number;
  };
  expenses: {
    rent: number;
    electricityAndHeating: number;
    homeInsurance: number;
    groceries: number;
    childcareAndSchool: number;
    childrenClothing: number;
    publicTransit: number;
    carAndFuel: number;
    phoneAndInternet: number;
    healthAndMedication: number;
    unionAndAkassa: number;
    leisureAndActivities: number;
    emergencySavings: number;
  };
}


