import { useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser, logout } from './api';
import Auth from './components/Auth';
import Tickets from './components/Tickets';

function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      {user && (
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #ddd',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 1200,
            margin: '0 auto'
          }}>
            <h1 style={{ margin: 0, color: '#333' }}>Ticketing System</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#666' }}>
                Welcome, {user.name || user.email}!
              </span>
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: user.role === 'admin' ? '#dc3545' : '#28a745',
                color: 'white',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}>
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {!user ? (
          <Auth onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Tickets user={user} />
        )}
      </main>
    </div>
  );
}

export default App;
