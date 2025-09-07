import React, { useState } from 'react';
import FigmaConnector from './components/FigmaConnector';
import FigmaDataDisplay from './components/FigmaDataDisplay';
import './styles/global.css';
import 'remixicon/fonts/remixicon.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [figmaData, setFigmaData] = useState(null);

  const handleConnect = (data) => {
    setFigmaData(data);
    setConnected(true);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setFigmaData(null);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>Figma Data Explorer</h1>
        </div>
      </header>
      
      <div className="container">
        {!connected ? (
          <FigmaConnector onConnect={handleConnect} />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2>Connected to: {figmaData.fileData.name}</h2>
                <p className="text-secondary">File ID: {figmaData.fileId}</p>
              </div>
              <button onClick={handleDisconnect}>
                <i className="ri-logout-box-line"></i>
                <span>Disconnect</span>
              </button>
            </div>
            
            <FigmaDataDisplay 
              figmaApi={figmaData.figmaApi} 
              fileId={figmaData.fileId}
              fileData={figmaData.fileData}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;