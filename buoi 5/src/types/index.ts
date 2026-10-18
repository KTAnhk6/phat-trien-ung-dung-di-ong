export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: number;
  duration: number;
  thumbnail: string;
  trailerUrl: string;
  createdAt: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: string;
  duration: string;
  thumbnail: string;
  trailerUrl: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
}
