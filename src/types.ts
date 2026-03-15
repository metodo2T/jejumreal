
export enum ProtocolType {
  H12 = '12h',
  H14 = '14h',
  H16 = '16h',
  H18 = '18h',
  H20 = '20h',
  H24 = '24h'
}

export interface UserProgress {
  id: string;
  date: string;
  weight: number;
  waist: number;
  hips: number;
  abdomen: number;
  thigh: number;
  arm: number;
  photoUrl?: string;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface Live {
  id: string;
  title: string;
  date: string;
  time: string;
  url: string;
}

export interface ProtocolDetail {
  id: ProtocolType;
  title: string;
  description: string;
  benefits: string[];
  indicatedFor: string;
  howToStart: string;
  allowedDuring: string[];
  commonMistakes: string[];
  menus: {
    basic: string[];
    intermediate: string[];
    advanced: string[];
  };
  pdfUrl?: string;
}

export interface AppUser {
  id: string;
  name: string;
  protocol: string;
  photoURL?: string;
  memberSince?: string;
}
