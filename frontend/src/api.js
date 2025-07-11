// All API calls live here.
// TODO: Replace the placeholders with real fetch/axios calls to your Express backend.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Tickets -------------
export async function getTickets(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.organisation_id) queryParams.append('organisation_id', filters.organisation_id);
  if (filters.user_id) queryParams.append('user_id', filters.user_id);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const url = `${API_URL}/api/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function getTicketById(id) {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function createTicket(data) {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateTicket(id, data) {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export async function updateTicketStatus(id, status) {
  return updateTicket(id, { status });
}

export async function deleteTicket(id) {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function getTicketStats() {
  const response = await fetch(`${API_URL}/api/tickets/stats`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

// Authentication -------------
export async function register(userData) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return handleResponse(response);
}

export async function login(credentials) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const result = await handleResponse(response);
  
  // Store token in localStorage
  if (result.data && result.data.token) {
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  
  return result;
}

export async function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}

export async function updatePassword(passwordData) {
  const response = await fetch(`${API_URL}/api/auth/password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData)
  });
  return handleResponse(response);
}

export async function refreshToken(token) {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const result = await handleResponse(response);
  
  // Update stored token
  if (result.data && result.data.token) {
    localStorage.setItem('authToken', result.data.token);
  }
  
  return result;
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Get current user from localStorage
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
