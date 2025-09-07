import React, { useState } from 'react';
import createFigmaApiService from '../services/figmaApi';

const FigmaConnector = ({ onConnect }) => {
  const [token, setToken] = useState('');
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    
    if (!token || !fileId) {
      setError('Please provide both a Figma access token and file ID.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const figmaApi = createFigmaApiService(token);
      
      // First, validate the token and file ID by getting the file data
      const fileData = await figmaApi.getFile(fileId);
      
      // If we get here, we have valid credentials and file ID
      onConnect({ token, fileId, figmaApi, fileData });
    } catch (err) {
      console.error('Error connecting to Figma:', err);
      
      if (err.response) {
        if (err.response.status === 403) {
          setError('Invalid Figma access token. Please check and try again.');
        } else if (err.response.status === 404) {
          setError('File not found. Please check the file ID and try again.');
        } else {
          setError(`Error: ${err.response.data.message || 'Failed to connect to Figma API'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Connect to Figma</h2>
      <form onSubmit={handleConnect}>
        <div className="form-group">
          <label htmlFor="token">Figma Access Token</label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your Figma personal access token"
            required
          />
          <p className="text-secondary mt-4">
            <i className="ri-information-line"></i> You can create a personal access token in 
            Figma under Account Settings &gt; Personal Access Tokens.
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="fileId">Figma File ID</label>
          <input
            id="fileId"
            type="text"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="Enter the Figma file ID (e.g., Fp8e5AJgU5SZ9w5eKMf9kZ)"
            required
          />
          <p className="text-secondary mt-4">
            <i className="ri-information-line"></i> The file ID is in the URL of your Figma file:
            figma.com/file/<strong>FILE_ID</strong>/title
          </p>
        </div>
        
        {error && <p className="text-error mb-4">{error}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="loader"></span>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <i className="ri-link"></i>
              <span>Connect</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FigmaConnector;