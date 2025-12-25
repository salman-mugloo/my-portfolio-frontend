const API_URL = import.meta.env.VITE_API_URL;

// CSRF token cache
let csrfTokenCache = null;
let csrfTokenPromise = null;

/**
 * Fetch CSRF token from server
 * @param {boolean} forceRefresh - Force refresh even if cached
 * @returns {Promise<string>} - CSRF token
 */
export const fetchCSRFToken = async (forceRefresh = false) => {
  // Return cached token if available and not forcing refresh
  if (csrfTokenCache && !forceRefresh) {
    return csrfTokenCache;
  }

  // If a request is already in progress, wait for it
  if (csrfTokenPromise && !forceRefresh) {
    return csrfTokenPromise;
  }

  // Fetch new token
  csrfTokenPromise = (async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_URL}/auth/csrf-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      csrfTokenCache = data.csrfToken;
      return csrfTokenCache;
    } catch (error) {
      csrfTokenCache = null;
      throw error;
    } finally {
      csrfTokenPromise = null;
    }
  })();

  return csrfTokenPromise;
};

/**
 * Clear CSRF token cache (on logout)
 */
export const clearCSRFToken = () => {
  csrfTokenCache = null;
  csrfTokenPromise = null;
};

/**
 * Get CSRF token, fetching if necessary
 * @param {string} method - HTTP method
 * @returns {Promise<string|null>} - CSRF token or null if not needed
 */
const getCSRFToken = async (method) => {
  // Only need CSRF token for POST, PUT, DELETE, PATCH
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!protectedMethods.includes(method.toUpperCase())) {
    return null;
  }

  // Check if user is authenticated
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return null;
  }

  try {
    return await fetchCSRFToken();
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

const apiCall = async (endpoint, options = {}, retryOnCSRF = true) => {
  const token = localStorage.getItem('adminToken');
  const method = options.method || 'GET';
  
  // Get CSRF token for protected methods
  const csrfToken = await getCSRFToken(method);
  
  // Check if body is FormData (for file uploads)
  const isFormData = options.body instanceof FormData;
  
  const config = {
    headers: {
      // Don't set Content-Type for FormData, browser will set it with boundary
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Check if it's a CSRF error and retry once
      if (response.status === 403 && data.message && data.message.includes('CSRF') && retryOnCSRF) {
        // Clear cache and retry once
        csrfTokenCache = null;
        const newCsrfToken = await getCSRFToken(method);
        if (newCsrfToken) {
          // Retry with new token
          return apiCall(endpoint, options, false);
        }
      }
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }
    
    // Check for forceLogout flag
    if (data.forceLogout === true) {
      localStorage.removeItem('adminToken');
      clearCSRFToken();
      window.location.href = '/cms/login';
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    // Re-throw with more context if it's a network error
    if (error.message.includes('fetch')) {
      throw new Error('Failed to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
};

export const authAPI = {
  login: (username, password) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST'
    }),
  changePassword: (currentPassword, newPassword) =>
    apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    }),
  changeUsername: (newUsername) =>
    apiCall('/admin/change-username', {
      method: 'PUT',
      body: JSON.stringify({ newUsername })
    }),
  forgotPassword: (username) =>
    apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ username })
    }),
  resetPassword: (token, newPassword) =>
    apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    }),
  verifyLoginOTP: (email, otp) =>
    apiCall('/auth/verify-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }),
  resendLoginOTP: (email) =>
    apiCall('/auth/resend-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
};

export const projectsAPI = {
  getAll: () => apiCall('/projects/admin'),
  create: (project) => apiCall('/projects/admin', {
    method: 'POST',
    body: JSON.stringify(project)
  }),
  update: (id, project) => apiCall(`/projects/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project)
  }),
  delete: (id) => apiCall(`/projects/admin/${id}`, {
    method: 'DELETE'
  })
};

export const expertiseAPI = {
  getAll: () => apiCall('/expertise/admin'),
  create: (expertise) => apiCall('/expertise/admin', {
    method: 'POST',
    body: JSON.stringify(expertise)
  }),
  update: (id, expertise) => apiCall(`/expertise/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expertise)
  }),
  delete: (id) => apiCall(`/expertise/admin/${id}`, {
    method: 'DELETE'
  })
};

export const skillsAPI = {
  getAll: () => apiCall('/skills/admin'),
  create: (skill) => apiCall('/skills/admin', {
    method: 'POST',
    body: JSON.stringify(skill)
  }),
  update: (id, skill) => apiCall(`/skills/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(skill)
  }),
  delete: (id) => apiCall(`/skills/admin/${id}`, {
    method: 'DELETE'
  })
};

export const featuresAPI = {
  getAll: () => apiCall('/features/admin'),
  create: (feature) => apiCall('/features/admin', {
    method: 'POST',
    body: JSON.stringify(feature)
  }),
  update: (id, feature) => apiCall(`/features/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(feature)
  }),
  delete: (id) => apiCall(`/features/admin/${id}`, {
    method: 'DELETE'
  })
};

export const contactInfoAPI = {
  get: () => apiCall('/contact-info/admin'),
  update: (contactInfo) => apiCall('/contact-info/admin', {
    method: 'PUT',
    body: JSON.stringify(contactInfo)
  })
};

export const educationAPI = {
  getAll: () => apiCall('/education/admin'),
  create: (education) => apiCall('/education/admin', {
    method: 'POST',
    body: JSON.stringify(education)
  }),
  update: (id, education) => apiCall(`/education/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(education)
  }),
  delete: (id) => apiCall(`/education/admin/${id}`, {
    method: 'DELETE'
  })
};

export const certificationsAPI = {
  getAll: () => apiCall('/certifications/admin'),
  create: (formData) => apiCall('/certifications/admin', {
    method: 'POST',
    body: formData
  }),
  update: (id, formData) => apiCall(`/certifications/admin/${id}`, {
    method: 'PUT',
    body: formData
  }),
  delete: (id) => apiCall(`/certifications/admin/${id}`, {
    method: 'DELETE'
  })
};

export const resumeAPI = {
  getAll: () => apiCall('/resume/admin'),
  getActive: () => apiCall('/resume'),
  upload: (formData) => apiCall('/resume/admin', {
    method: 'POST',
    body: formData
  }),
  delete: (id) => apiCall(`/resume/admin/${id}`, {
    method: 'DELETE'
  })
};

export const activityAPI = {
  getLogs: (page = 1, limit = 20) => 
    apiCall(`/activity/admin?page=${page}&limit=${limit}`)
};

export const profileAPI = {
  getProfile: () => apiCall('/profile'),
  updateProfile: (profileData) => 
    apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
  uploadProfileImage: (formData) => apiCall('/profile/image', {
    method: 'POST',
    body: formData
  }),
  deleteProfileImage: () => apiCall('/profile/image', { method: 'DELETE' }),
  uploadResume: (formData) => apiCall('/profile/resume', {
    method: 'PUT',
    body: formData
  }),
  deleteResume: () => apiCall('/profile/resume', { method: 'DELETE' })
};


