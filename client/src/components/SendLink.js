import React, { useState } from 'react';
import axios from 'axios';

const SendLink = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    message: 'Hi! I need your current location. Please click the link below to share it with me.'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/send-sms', formData);
      setResult(response.data);
      
      // Reset form after successful send
      setFormData({
        phoneNumber: '',
        message: 'Hi! I need your current location. Please click the link below to share it with me.'
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX for US numbers
    if (digits.length <= 10) {
      return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    // For international numbers, just add + prefix if not present
    return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      phoneNumber: formatted
    }));
  };

  return (
    <div className="card">
      <h2>Send Location Request</h2>
      <p>Send an SMS with a location sharing link to any mobile number.</p>
      
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="alert alert-success">
          <strong>SMS Sent Successfully!</strong>
          <br />
          Session ID: {result.sessionId}
          <br />
          Message ID: {result.messageId}
          <br />
          <a href={result.locationLink} target="_blank" rel="noopener noreferrer">
            Preview Location Link
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+1 (555) 123-4567"
            required
          />
          <small style={{ color: '#666', fontSize: '0.9em' }}>
            Enter a valid phone number (with country code)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter your message..."
            required
          />
          <small style={{ color: '#666', fontSize: '0.9em' }}>
            The location sharing link will be automatically added to this message
          </small>
        </div>

        <button 
          type="submit" 
          className="btn"
          disabled={loading || !formData.phoneNumber || !formData.message}
        >
          {loading && <div className="loading"></div>}
          {loading ? 'Sending SMS...' : 'Send Location Request'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>How it works:</h3>
        <ol style={{ textAlign: 'left', paddingLeft: '1.5rem' }}>
          <li>Enter the recipient's phone number</li>
          <li>Customize your message (optional)</li>
          <li>Click "Send Location Request"</li>
          <li>The recipient will receive an SMS with a link</li>
          <li>When they click the link, they can share their location</li>
          <li>You can track the location sharing status</li>
        </ol>
      </div>
    </div>
  );
};

export default SendLink;