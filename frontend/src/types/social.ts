export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  verified?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

export interface Post {
  id: string;
  user: User;
  content: string;
  images?: string[];
  createdAt: string;
  likes: number;
  comments: Comment[];
  shares: number;
  liked: boolean;
  bookmarked: boolean;
}

export interface CreatePostData {
  content: string;
  images?: File[];
}

