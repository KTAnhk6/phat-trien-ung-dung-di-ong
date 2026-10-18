import { API_ENDPOINTS } from '@/constants/api';
import { Category, Course, CategoryFormData } from '@/types';

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Yêu cầu thất bại với mã lỗi: ${response.status}`;
    try {
      const errorData = await response.json();
      if (typeof errorData === 'string') errorMessage = errorData;
      else if (errorData?.message) errorMessage = errorData.message;
    } catch {
      // ignore json parse error
    }
    throw new ApiError(errorMessage, response.status);
  }
  return response.json();
}

export const ApiService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(API_ENDPOINTS.CATEGORIES, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<Category[]>(response);
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(API_ENDPOINTS.CATEGORY_DETAIL(id), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<Category>(response);
  },

  async createCategory(data: CategoryFormData): Promise<Category> {
    const response = await fetch(API_ENDPOINTS.CATEGORIES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  async updateCategory(id: string, data: CategoryFormData): Promise<Category> {
    const response = await fetch(API_ENDPOINTS.CATEGORY_DETAIL(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(response);
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.CATEGORY_DETAIL(id), {
      method: 'DELETE',
    });
    await handleResponse<unknown>(response);
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const response = await fetch(API_ENDPOINTS.COURSES, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<Course[]>(response);
  },

  async getCourseById(id: string): Promise<Course> {
    const response = await fetch(API_ENDPOINTS.COURSE_DETAIL(id), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<Course>(response);
  },

  async createCourse(data: Omit<Course, 'id'>): Promise<Course> {
    const response = await fetch(API_ENDPOINTS.COURSES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Course>(response);
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    const response = await fetch(API_ENDPOINTS.COURSE_DETAIL(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Course>(response);
  },

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.COURSE_DETAIL(id), {
      method: 'DELETE',
    });
    await handleResponse<unknown>(response);
  },
};
