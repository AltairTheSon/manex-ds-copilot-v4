import React, { useState } from 'react';

const JsonViewer = ({ data, initialExpansionDepth = 1, maxDisplayDepth = 20 }) => {
  const [expandedNodes, setExpandedNodes] = useState({});
  
  const toggleNode = (path) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const renderValue = (value, path, depth) => {
    if (depth > maxDisplayDepth) {
      return <span className="text-secondary">[Maximum depth reached]</span>;
    }
    
    if (value === null) return <span className="text-secondary">null</span>;
    if (value === undefined) return <span className="text-secondary">undefined</span>;
    
    if (typeof value === 'object' && value !== null) {
      const isArray = Array.isArray(value);
      const isEmpty = isArray ? value.length === 0 : Object.keys(value).length === 0;
      
      if (isEmpty) {
        return <span>{isArray ? '[]' : '{}'}</span>;
      }
      
      const isExpanded = depth <= initialExpansionDepth || expandedNodes[path];
      
      return (
        <div>
          <span 
            onClick={() => toggleNode(path)}
            className="json-toggle"
            style={{ cursor: 'pointer' }}
          >
            {isArray ? '[' : '{'}
            {!isExpanded && <span className="json-preview">
              {isArray 
                ? `${value.length} items` 
                : Object.keys(value).slice(0, 3).join(', ') + (Object.keys(value).length > 3 ? '...' : '')}
            </span>}
            {!isExpanded && (isArray ? ']' : '}')}
          </span>
          
          {isExpanded && (
            <div className="json-children" style={{ paddingLeft: '20px' }}>
              {isArray ? (
                // Only render first 100 items for arrays to prevent lag
                value.slice(0, 100).map((item, i) => (
                  <div key={i} className="json-item">
                    {i < 100 ? (
                      <>
                        <span className="json-key">{i}:</span>
                        {renderValue(item, `${path}.${i}`, depth + 1)}
                      </>
                    ) : i === 100 ? (
                      <span className="text-secondary">[...{value.length - 100} more items]</span>
                    ) : null}
                  </div>
                ))
              ) : (
                // Only render first 100 keys for objects to prevent lag
                Object.keys(value).slice(0, 100).map((key) => (
                  <div key={key} className="json-item">
                    <span className="json-key">{key}:</span>
                    {renderValue(value[key], `${path}.${key}`, depth + 1)}
                  </div>
                ))
              )}
              {(isArray && value.length > 100) && (
                <div className="json-item text-secondary">[...{value.length - 100} more items]</div>
              )}
              {(!isArray && Object.keys(value).length > 100) && (
                <div className="json-item text-secondary">[...{Object.keys(value).length - 100} more properties]</div>
              )}
              <div>{isArray ? ']' : '}'}</div>
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'string') return <span className="json-string">"{value}"</span>;
    if (typeof value === 'number') return <span className="json-number">{value}</span>;
    if (typeof value === 'boolean') return <span className="json-boolean">{value.toString()}</span>;
    
    return <span>{String(value)}</span>;
  };
  
  return (
    <div className="json-viewer">
      {renderValue(data, 'root', 0)}
    </div>
  );
};

export default JsonViewer;