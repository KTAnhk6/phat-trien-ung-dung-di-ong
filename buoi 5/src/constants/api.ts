export const API_BASE_URL = 'https://6ad53af748476c0785d97013.mockapi.io/api/v1';

export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY_DETAIL: (id: string) => `${API_BASE_URL}/categories/${id}`,
  COURSES: `${API_BASE_URL}/courses`,
  COURSE_DETAIL: (id: string) => `${API_BASE_URL}/courses/${id}`,
};
