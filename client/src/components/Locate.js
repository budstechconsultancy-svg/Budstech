import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Locate = () => {
  const { sessionId } = useParams();
  const [locationShared, setLocationShared] = useState(false);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, requesting, success, error

  const fetchSessionInfo = useCallback(async () => {
    try {
      const response = await axios.get(`/api/location/${sessionId}`);
      setSessionInfo(response.data);
      
      // Check if location was already shared
      if (response.data.location) {
        setLocationShared(true);
        setLocationStatus('success');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Invalid or expired location sharing link');
      } else {
        setError('Failed to load session information');
      }
    }
  }, [sessionId]);

  useEffect(() => {
    // Fetch session information when component mounts
    fetchSessionInfo();
  }, [fetchSessionInfo]);

  const requestLocation = () => {
    setLocationStatus('requesting');
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationStatus('error');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // 30 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };

          await axios.post(`/api/location/${sessionId}`, locationData);
          
          setLocationShared(true);
          setLocationStatus('success');
          
          // Refresh session info to show the updated data
          fetchSessionInfo();
        } catch (err) {
          setError('Failed to save your location. Please try again.');
          setLocationStatus('error');
        }
      },
      (err) => {
        let errorMessage;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. Please enable location permissions and try again.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device settings.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving your location.';
            break;
        }
        setError(errorMessage);
        setLocationStatus('error');
      },
      options
    );
  };

  const formatCoordinate = (coord) => {
    return coord ? coord.toFixed(6) : 'N/A';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  };

  const openInMaps = () => {
    if (sessionInfo?.location) {
      const { latitude, longitude } = sessionInfo.location;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  if (!sessionId) {
    return (
      <div className="card">
        <div className="alert alert-error">
          <strong>Error:</strong> No session ID provided
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Share Your Location</h2>
      
      {sessionInfo && (
        <div className="location-info">
          <p><strong>Original Message:</strong> {sessionInfo.originalMessage}</p>
          <p><strong>Requested:</strong> {formatDate(sessionInfo.sentAt)}</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {locationShared ? (
        <div>
          <div className="alert alert-success">
            <strong>Location Shared Successfully!</strong>
            <br />
            Your location has been shared with the requester.
          </div>
          
          {sessionInfo?.location && (
            <div className="location-info">
              <h3>Your Shared Location:</h3>
              <div className="location-details">
                <div className="location-detail">
                  <strong>Latitude:</strong>
                  {formatCoordinate(sessionInfo.location.latitude)}
                </div>
                <div className="location-detail">
                  <strong>Longitude:</strong>
                  {formatCoordinate(sessionInfo.location.longitude)}
                </div>
                <div className="location-detail">
                  <strong>Accuracy:</strong>
                  {sessionInfo.location.accuracy ? `±${Math.round(sessionInfo.location.accuracy)}m` : 'N/A'}
                </div>
                <div className="location-detail">
                  <strong>Shared At:</strong>
                  {formatDate(sessionInfo.locationReceivedAt)}
                </div>
              </div>
              <button className="btn btn-secondary" onClick={openInMaps}>
                View on Maps
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>
            Someone has requested your current location. Click the button below to share your location securely.
          </p>
          
          <div className="alert alert-info">
            <strong>Privacy Notice:</strong> Your location will only be shared with the person who sent you this link. 
            We do not store your location data permanently.
          </div>

          <button 
            className="btn" 
            onClick={requestLocation}
            disabled={locationStatus === 'requesting'}
          >
            {locationStatus === 'requesting' && <div className="loading"></div>}
            {locationStatus === 'requesting' ? 'Getting Location...' : 'Share My Location'}
          </button>

          {locationStatus === 'requesting' && (
            <div style={{ marginTop: '1rem', color: '#666' }}>
              <p>Please allow location access when prompted by your browser.</p>
              <p>This may take a few moments to get an accurate location...</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9em' }}>
        <h4>How this works:</h4>
        <ul style={{ textAlign: 'left', paddingLeft: '1.5rem', margin: 0 }}>
          <li>Your browser will request permission to access your location</li>
          <li>Once you grant permission, your GPS coordinates will be shared</li>
          <li>The person who sent you this link will be able to see your location</li>
          <li>No personal information other than your location is collected</li>
        </ul>
      </div>
    </div>
  );
};

export default Locate;