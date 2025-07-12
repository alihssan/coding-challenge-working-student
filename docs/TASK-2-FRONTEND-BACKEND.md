# Task 2: Frontend ↔ Backend Connection

## Overview
This document outlines the implementation of the frontend-backend integration, including the replacement of fake data with real API calls and the implementation of CRUD endpoints for tickets.

## Implementation Details

### 1. Backend API Endpoints

**Base URL:** `http://localhost:4000/api`

#### Authentication Endpoints
```javascript
POST   /api/auth/register    // User registration
POST   /api/auth/login       // User login
POST   /api/auth/refresh     // Token refresh
GET    /api/auth/profile     // Get user profile
PATCH  /api/auth/password    // Update password
```

#### Ticket Endpoints
```javascript
GET    /api/tickets          // Get all tickets (with filters)
GET    /api/tickets/:id      // Get single ticket
POST   /api/tickets          // Create new ticket
PATCH  /api/tickets/:id      // Update ticket
DELETE /api/tickets/:id      // Delete ticket
GET    /api/tickets/stats    // Get ticket statistics
```

#### User Endpoints
```javascript
GET    /api/users            // Get all users
GET    /api/users/:id        // Get single user
POST   /api/users            // Create new user
PATCH  /api/users/:id        // Update user
DELETE /api/users/:id        // Delete user
GET    /api/users/stats      // Get user statistics
```

#### Organisation Endpoints
```javascript
GET    /api/organisations    // Get all organisations
GET    /api/organisations/:id // Get single organisation
POST   /api/organisations    // Create new organisation
PATCH  /api/organisations/:id // Update organisation
DELETE /api/organisations/:id // Delete organisation
GET    /api/organisations/stats // Get organisation statistics
```

### 2. Frontend API Integration

**Location:** `frontend/src/api.js`

#### API Configuration
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

#### Authentication Helper Functions
```javascript
// Get auth headers with JWT token
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}
```

### 3. Ticket CRUD Operations

#### Get All Tickets
```javascript
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
```

#### Get Single Ticket
```javascript
export async function getTicketById(id) {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}
```

#### Create Ticket
```javascript
export async function createTicket(data) {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}
```

#### Update Ticket
```javascript
export async function updateTicket(id, data) {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}
```

#### Delete Ticket
```javascript
export async function deleteTicket(id) {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}
```

#### Get Ticket Statistics
```javascript
export async function getTicketStats() {
  const response = await fetch(`${API_URL}/api/tickets/stats`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}
```

### 4. Authentication Integration

#### Login
```javascript
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
```

#### Logout
```javascript
export async function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}
```

#### Authentication State Management
```javascript
// Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Get current user from localStorage
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
```

### 5. Frontend Application Integration

**Location:** `frontend/src/App.jsx`

#### State Management
```javascript
const [tickets, setTickets] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [user, setUser] = useState(getCurrentUser());
```

#### Data Fetching
```javascript
useEffect(() => {
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getTickets();
      setTickets(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated()) {
    fetchTickets();
  }
}, []);
```

#### Ticket Operations
```javascript
// Create ticket
const handleCreateTicket = async (ticketData) => {
  try {
    const response = await createTicket(ticketData);
    setTickets(prev => [...prev, response.data]);
  } catch (err) {
    setError(err.message);
  }
};

// Update ticket
const handleUpdateTicket = async (id, updateData) => {
  try {
    const response = await updateTicket(id, updateData);
    setTickets(prev => prev.map(ticket => 
      ticket.id === id ? response.data : ticket
    ));
  } catch (err) {
    setError(err.message);
  }
};

// Delete ticket
const handleDeleteTicket = async (id) => {
  try {
    await deleteTicket(id);
    setTickets(prev => prev.filter(ticket => ticket.id !== id));
  } catch (err) {
    setError(err.message);
  }
};
```

### 6. API Response Format

#### Success Response
```json
{
  "success": true,
  "data": [...],
  "timestamp": "2025-07-12T07:40:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "timestamp": "2025-07-12T07:40:00.000Z"
}
```

#### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "timestamp": "2025-07-12T07:40:00.000Z"
}
```

### 7. Error Handling

#### Network Errors
- Connection timeout handling
- Retry logic for failed requests
- User-friendly error messages

#### Authentication Errors
- Token expiration handling
- Automatic logout on auth failure
- Redirect to login page

#### Validation Errors
- Form validation feedback
- Server-side validation display
- Field-specific error messages

### 8. Security Features

#### JWT Token Management
- Secure token storage in localStorage
- Automatic token inclusion in requests
- Token refresh mechanism

#### CORS Configuration
```javascript
// backend/config/app.js
cors: {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}
```

#### Request Validation
- Input sanitization
- SQL injection prevention
- XSS protection

### 9. Performance Optimizations

#### Caching
- Local storage for user data
- Token caching
- Response caching where appropriate

#### Pagination
- Server-side pagination
- Infinite scroll support
- Page size optimization

#### Loading States
- Skeleton loading
- Progressive loading
- Error boundaries

### 10. Development Setup

#### Environment Variables
```env
# Frontend (.env)
VITE_API_URL=http://localhost:4000

# Backend (.env)
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

#### Development Commands
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 11. Testing the Integration

#### Health Check
```bash
curl http://localhost:4000/ping
```

#### API Documentation
```bash
curl http://localhost:4000/api
```

#### Test Authentication
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ali@donexus.com","password":"password123"}'
```

#### Test Tickets API
```bash
# Get all tickets (requires auth token)
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 12. Dependencies

#### Frontend Dependencies
- `react` - UI framework
- `vite` - Build tool
- `fetch` - HTTP client (built-in)

#### Backend Dependencies
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `helmet` - Security middleware
- `jsonwebtoken` - JWT handling

This implementation provides a complete, secure, and performant frontend-backend integration for the ticketing system. 