import { useState, useEffect } from 'react';
import { getTickets, createTicket, updateTicket, deleteTicket, getTicketStats } from '../api';

function Tickets({ user }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open'
  });

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getTickets();
      setTickets(response.data || response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getTicketStats();
      setStats(response.data || response);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await createTicket({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        user_id: user?.userId || 1,
        organisation_id: user?.organisationId || 1
      });

      setFormData({ title: '', description: '', status: 'open' });
      setShowCreateForm(false);
      await fetchTickets();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTicket || !formData.title.trim()) return;

    try {
      await updateTicket(editingTicket.id, {
        title: formData.title,
        description: formData.description,
        status: formData.status
      });

      setEditingTicket(null);
      setFormData({ title: '', description: '', status: 'open' });
      await fetchTickets();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await deleteTicket(id);
      await fetchTickets();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description || '',
      status: ticket.status
    });
  };

  const cancelEdit = () => {
    setEditingTicket(null);
    setFormData({ title: '', description: '', status: 'open' });
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#28a745';
      case 'in_progress': return '#ffc107';
      case 'closed': return '#6c757d';
      default: return '#007bff';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Loading tickets...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Ticketing System</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={user?.role === 'admin'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: user?.role === 'admin' ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: user?.role === 'admin' ? 'not-allowed' : 'pointer',
            opacity: user?.role === 'admin' ? 0.6 : 1
          }}
          title={user?.role === 'admin' ? 'Admin users cannot create tickets' : 'Create a new ticket'}
        >
          {showCreateForm ? 'Cancel' : 'Create Ticket'}
        </button>
      </div>

      {/* Admin notice */}
      {user?.role === 'admin' && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: 4,
          color: '#856404'
        }}>
          <strong>Admin Notice:</strong> As an admin user, you can view and manage all tickets across organizations, but you cannot create new tickets. Only regular users can create tickets.
        </div>
      )}

      {/* Stats */}
      {stats && Object.keys(stats).length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 8, textAlign: 'center' }}>
            <h3>Total Tickets</h3>
            <p style={{ fontSize: '2rem', margin: 0, color: '#007bff' }}>{stats.total || 0}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 8, textAlign: 'center' }}>
            <h3>Open</h3>
            <p style={{ fontSize: '2rem', margin: 0, color: '#28a745' }}>{stats.open || 0}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 8, textAlign: 'center' }}>
            <h3>In Progress</h3>
            <p style={{ fontSize: '2rem', margin: 0, color: '#ffc107' }}>{stats.in_progress || 0}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 8, textAlign: 'center' }}>
            <h3>Closed</h3>
            <p style={{ fontSize: '2rem', margin: 0, color: '#6c757d' }}>{stats.closed || 0}</p>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: 4,
          color: '#c33'
        }}>
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingTicket) && (
        <div style={{
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: 8,
          marginBottom: '2rem',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</h3>
          <form onSubmit={editingTicket ? handleUpdate : handleCreate}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '1rem'
                }}
                placeholder="Enter ticket title"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Enter ticket description"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: '1rem'
                }}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                {editingTicket ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={editingTicket ? cancelEdit : () => setShowCreateForm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ borderBottom: '2px solid #ddd', textAlign: 'left', padding: '1rem' }}>ID</th>
              <th style={{ borderBottom: '2px solid #ddd', textAlign: 'left', padding: '1rem' }}>Title</th>
              <th style={{ borderBottom: '2px solid #ddd', textAlign: 'left', padding: '1rem' }}>Description</th>
              <th style={{ borderBottom: '2px solid #ddd', textAlign: 'left', padding: '1rem' }}>Status</th>
              <th style={{ borderBottom: '2px solid #ddd', textAlign: 'left', padding: '1rem' }}>Created</th>
              <th style={{ borderBottom: '2px solid #ddd', textAlign: 'left', padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                  No tickets found. Create your first ticket!
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{ticket.id}</td>
                  <td style={{ padding: '1rem' }}>{ticket.title}</td>
                  <td style={{ padding: '1rem' }}>
                    {ticket.description ? (
                      <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.description}
                      </div>
                    ) : (
                      <span style={{ color: '#6c757d' }}>No description</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 4,
                      backgroundColor: getStatusColor(ticket.status) + '20',
                      color: getStatusColor(ticket.status),
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => startEdit(ticket)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tickets; 