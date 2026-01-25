import { useState } from 'react';
import './PasswordList.css';

function PasswordList() {
  // Demo data - In production, passwords would be fetched securely from backend
  const [passwords, setPasswords] = useState([
    { id: 1, service: 'Email', username: 'user@example.com', password: '••••••••' },
    { id: 2, service: 'Social Media', username: 'john_doe', password: '••••••••' },
    { id: 3, service: 'Banking', username: 'john.doe', password: '••••••••' },
  ]);

  const [showPassword, setShowPassword] = useState({});

  const togglePassword = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const deletePassword = (id) => {
    setPasswords(passwords.filter(p => p.id !== id));
  };

  return (
    <div className="password-list">
      <h2>Saved Passwords</h2>
      {passwords.length === 0 ? (
        <p className="empty-message">No passwords saved yet. Add one below!</p>
      ) : (
        <div className="passwords-grid">
          {passwords.map((item) => (
            <div key={item.id} className="password-card">
              <div className="password-card-header">
                <h3>{item.service}</h3>
                <button 
                  className="delete-btn"
                  onClick={() => deletePassword(item.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
              <div className="password-info">
                <div className="info-row">
                  <span className="label">Username:</span>
                  <span className="value">{item.username}</span>
                </div>
                <div className="info-row">
                  <span className="label">Password:</span>
                  <span className="value">
                    {showPassword[item.id] ? 'Demo-Pass123!' : item.password}
                  </span>
                  <button 
                    className="toggle-btn"
                    onClick={() => togglePassword(item.id)}
                  >
                    {showPassword[item.id] ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PasswordList;
