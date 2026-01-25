import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Profile.css';

function Profile() {
  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="content-wrapper">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-avatar">
                <svg 
                  width="100" 
                  height="100" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="8" r="3" />
                  <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
                </svg>
              </div>
              <h1>User Profile</h1>
            </div>
            
            <div className="profile-info">
              <div className="info-section">
                <h2>Personal Information</h2>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">John Doe</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">john.doe@example.com</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member Since:</span>
                  <span className="info-value">January 2026</span>
                </div>
              </div>
              
              <div className="info-section">
                <h2>Vault Statistics</h2>
                <div className="info-item">
                  <span className="info-label">Total Passwords:</span>
                  <span className="info-value">3</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">Today</span>
                </div>
              </div>
            </div>
            
            <div className="profile-actions">
              <Link to="/" className="back-button">
                ← Back to Vault
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
