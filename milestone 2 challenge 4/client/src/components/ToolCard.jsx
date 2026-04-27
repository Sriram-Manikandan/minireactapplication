import React, { useState } from 'react';

const ToolCard = ({ tool, onUpdate }) => {
  const [borrowError, setBorrowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // FIXED: Proper async handling with server data integration
  const handleBorrow = async () => {
    setBorrowError(false);
    setIsLoading(true);
    
    try {
      // FIXED: Correct endpoint path (/api/tools/:id instead of /api/tool/:id)
      const response = await fetch(`/api/tools/${tool.id}`, { method: 'PATCH' });
      
      if (response.ok) {
        // FIXED: Use the actual updated tool from the database
        const updatedFromDB = await response.json();
        onUpdate(updatedFromDB);
      } else {
        setBorrowError(true);
      }
    } catch (error) {
      setBorrowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`tool-card ${!tool.isAvailable ? 'borrowed' : ''}`}>
      <div className="tool-header">
        <span className="tool-icon">🔧</span>
        <div>
          <h3>{tool.name}</h3>
          <span className={`status-badge ${tool.isAvailable ? 'available' : 'unavailable'}`}>
            {tool.isAvailable ? '✅ Available' : '🔴 Borrowed'}
          </span>
        </div>
      </div>

      <p>{tool.description}</p>

      <div className="tool-actions">
        <button
          onClick={handleBorrow}
          disabled={isLoading}
          className={tool.isAvailable ? 'borrow-btn' : 'return-btn'}
        >
          {isLoading ? '...' : tool.isAvailable ? 'Borrow' : 'Return'}
        </button>
      </div>

      {borrowError && (
        <div className="borrow-error">
          ⚠️ Action failed. Server returned an error.
        </div>
      )}
    </div>
  );
};

export default ToolCard;
