const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7002/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
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

// Projects API
export const projectsAPI = {
  getProjects: () => apiCall('/projects'),
  getAllProjects: () => apiCall('/projects/admin'),
  createProject: (project) => 
    apiCall('/projects/admin', {
      method: 'POST',
      body: JSON.stringify(project)
    }),
  updateProject: (id, project) => 
    apiCall(`/projects/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    }),
  deleteProject: (id) => 
    apiCall(`/projects/admin/${id}`, {
      method: 'DELETE'
    })
};

// Expertise API
export const expertiseAPI = {
  getExpertise: () => apiCall('/expertise'),
  getAllExpertise: () => apiCall('/expertise/admin'),
  createExpertise: (expertise) => 
    apiCall('/expertise/admin', {
      method: 'POST',
      body: JSON.stringify(expertise)
    }),
  updateExpertise: (id, expertise) => 
    apiCall(`/expertise/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expertise)
    }),
  deleteExpertise: (id) => 
    apiCall(`/expertise/admin/${id}`, {
      method: 'DELETE'
    })
};

// Skills API
export const skillsAPI = {
  getSkills: () => apiCall('/skills'),
  getAllSkills: () => apiCall('/skills/admin'),
  createSkill: (skill) => 
    apiCall('/skills/admin', {
      method: 'POST',
      body: JSON.stringify(skill)
    }),
  updateSkill: (id, skill) => 
    apiCall(`/skills/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skill)
    }),
  deleteSkill: (id) => 
    apiCall(`/skills/admin/${id}`, {
      method: 'DELETE'
    })
};

// Certifications API
export const certificationsAPI = {
  getCertifications: () => apiCall('/certifications'),
  getAllCertifications: () => apiCall('/certifications/admin'),
  createCertification: (formData) => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_BASE_URL}/certifications/admin`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(res => res.json());
  },
  updateCertification: (id, formData) => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_BASE_URL}/certifications/admin/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(res => res.json());
  },
  deleteCertification: (id) => 
    apiCall(`/certifications/admin/${id}`, {
      method: 'DELETE'
    })
};

// Resume API
export const resumeAPI = {
  getResume: () => apiCall('/resume'),
  getAllResumes: () => apiCall('/resume/admin'),
  uploadResume: (formData) => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_BASE_URL}/resume/admin`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(res => res.json());
  },
  deleteResume: (id) => 
    apiCall(`/resume/admin/${id}`, {
      method: 'DELETE'
    })
};

// Contact API
export const contactAPI = {
  sendMessage: (messageData) => 
    apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData)
    })
};

// Profile API
export const profileAPI = {
  getProfile: () => apiCall('/profile'),
  updateProfile: (profileData) => 
    apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }),
  uploadProfileImage: (formData) => {
    const token = localStorage.getItem('adminToken');
    return fetch(`${API_BASE_URL}/profile/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    }).then(res => res.json());
  }
};

// Features API
export const featuresAPI = {
  getFeatures: () => apiCall('/features')
};

// Contact Info API
export const contactInfoAPI = {
  getContactInfo: () => apiCall('/contact-info')
};

// Education API
export const educationAPI = {
  getEducation: () => apiCall('/education')
};
