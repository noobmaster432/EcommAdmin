// API configuration
export const API_BASE_URL = 'https://ecommerce-backend-public-vw6i.onrender.com';

// Helper function for API requests
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // For non-JSON responses (like file uploads)
    if (options.headers && (options.headers as any)['Content-Type'] === 'multipart/form-data') {
      return response;
    }

    // Handle empty responses
    if (response.status === 204) {
      return null;
    }

    // Check if the response has content before parsing JSON
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    
    if (!response.ok) {
      throw new Error(data?.message || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    fetchApi('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData: { email: string; fullName: string; password: string }) => 
    fetchApi('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  verifyOtp: (data: { userId: string; otp: string }) => 
    fetchApi('/users/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  resendOtp: (data: { email: string }) => 
    fetchApi('/users/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Users API
export const usersApi = {
  getAll: () => fetchApi('/users/all'),
  getById: (id: string) => fetchApi(`/users/single/${id}`),
  update: (id: string, data: any) => 
    fetchApi(`/users/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updatePassword: (id: string, data: { currentPassword: string; newPassword: string }) => 
    fetchApi(`/users/update-password/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Products API
export const productsApi = {
  getAll: () => fetchApi('/products/all'),
  getById: (id: string) => fetchApi(`/products/single/${id}`),
  getLatest: () => fetchApi('/products/latest'),
  getCategories: () => fetchApi('/categories/all'),
  
  create: (formData: FormData) => {
    // For FormData, don't set Content-Type header as the browser will set it with the boundary
    return fetch(`${API_BASE_URL}/products/new`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  },
  
  update: (id: string, formData: FormData) => {
    return fetch(`${API_BASE_URL}/products/update/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
  },
  
  delete: (id: string) => 
    fetchApi(`/products/delete/${id}`, {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersApi = {
  getAll: () => fetchApi('/orders/admin'),
  getById: (id: number) => fetchApi(`/orders/${id}`),
  getUserOrders: (userId: number) => fetchApi(`/orders/user/${userId}`),
  create: (cartId: number, orderData: any) => 
    fetchApi(`/orders/${cartId}`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  updateStatus: (orderId: number, statusData: any) => 
    fetchApi(`/orders/status/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),
  cancelOrder: (orderId: number, userId: number) => 
    fetchApi(`/orders/${orderId}/${userId}`, {
      method: 'PUT',
    }),
};