export interface Comment {
  id: string;
  user: string;
  date: string;
  content: string;
  isAdmin?: boolean;
  replies?: Comment[];
}

export interface Game {
  id: string;
  title: string;
  console: string;
  year: string;
  size: string;
  format: string;
  description: string;
  publisher: string;
  imageUrl: string;
  screenshots?: string[];
  downloadUrl?: string;
  downloads: number;
  rating: number;
  voteCount?: number; // Added to track number of votes
  languages: ('English' | 'Spanish' | 'Japanese' | 'Multi')[];
  comments?: Comment[];
}

export interface Report {
  id: string;
  gameId: string;
  gameTitle: string;
  reason: 'Link Caído' | 'Imagen Rota' | 'Información Incorrecta' | 'Otro';
  description?: string;
  date: string;
  status: 'Pending' | 'Resolved';
}

export type SortOption = 'Alphabetically' | 'Date' | 'Popularity';