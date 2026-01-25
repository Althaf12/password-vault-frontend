import { useState } from 'react';
import './AddPasswordForm.css';

function AddPasswordForm() {
  const [formData, setFormData] = useState({
    service: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save to backend/state
    console.log('Saving password:', formData);
    alert(`Password for ${formData.service} saved successfully!`);
    setFormData({ service: '', username: '', password: '' });
  };

  return (
    <div className="add-password-form">
      <h2>Add New Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="service">Service Name</label>
          <input
            type="text"
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            placeholder="e.g., Gmail, Facebook"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username/Email</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="username or email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>
        
        <button type="submit" className="submit-btn">
          Add Password
        </button>
      </form>
    </div>
  );
}

export default AddPasswordForm;
