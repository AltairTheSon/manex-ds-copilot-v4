import React, { useState, useEffect, useCallback } from 'react';
import JsonViewer from './JsonViewer';

const FigmaDataDisplay = ({ figmaApi, fileId, fileData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState({});
  const [data, setData] = useState({
    overview: fileData,
    components: null,
    styles: null,
    images: null,
    comments: null,
    user: null
  });
  const [error, setError] = useState({});
  const [showFullDocument, setShowFullDocument] = useState(false);

  const loadData = useCallback(async (dataType, apiCall) => {
    if (data[dataType] !== null) return;

    setLoading(prev => ({ ...prev, [dataType]: true }));
    setError(prev => ({ ...prev, [dataType]: null }));
    
    try {
      const result = await apiCall();
      setData(prev => ({ ...prev, [dataType]: result }));
    } catch (err) {
      console.error(`Error loading ${dataType}:`, err);
      setError(prev => ({ 
        ...prev, 
        [dataType]: err.response?.data?.message || err.message || 'Failed to load data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [dataType]: false }));
    }
  }, [data]);

  const loadComponentsData = useCallback(() => loadData('components', () => figmaApi.getFileComponents(fileId)), [loadData, figmaApi, fileId]);
  const loadStylesData = useCallback(() => loadData('styles', () => figmaApi.getFileStyles(fileId)), [loadData, figmaApi, fileId]);
  const loadImagesData = useCallback(() => loadData('images', () => figmaApi.getFileImages(fileId)), [loadData, figmaApi, fileId]);
  const loadCommentsData = useCallback(() => loadData('comments', () => figmaApi.getFileComments(fileId)), [loadData, figmaApi, fileId]);
  const loadUserData = useCallback(() => loadData('user', () => figmaApi.getUserInfo()), [loadData, figmaApi]);

  useEffect(() => {
    // Initial load for the overview tab is already done via fileData
    loadUserData();
  }, [loadUserData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Load data for the selected tab if not already loaded
    switch (tab) {
      case 'components':
        loadComponentsData();
        break;
      case 'styles':
        loadStylesData();
        break;
      case 'images':
        loadImagesData();
        break;
      case 'comments':
        loadCommentsData();
        break;
      default:
        break;
    }
  };

  // Calculate document size to warn about performance
  const getDocumentSize = () => {
    if (!data.overview?.document) return 0;
    return JSON.stringify(data.overview.document).length;
  };
  
  const documentSize = getDocumentSize();
  const isLargeDocument = documentSize > 1000000; // 1MB JSON is quite large

  return (
    <div className="data-section">
      <div className="data-tabs">
        <div 
          className={`data-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <i className="ri-file-list-line"></i> Overview
        </div>
        <div 
          className={`data-tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => handleTabChange('components')}
        >
          <i className="ri-layout-masonry-line"></i> Components
        </div>
        <div 
          className={`data-tab ${activeTab === 'styles' ? 'active' : ''}`}
          onClick={() => handleTabChange('styles')}
        >
          <i className="ri-palette-line"></i> Styles
        </div>
        <div 
          className={`data-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => handleTabChange('images')}
        >
          <i className="ri-image-line"></i> Images
        </div>
        <div 
          className={`data-tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => handleTabChange('comments')}
        >
          <i className="ri-chat-1-line"></i> Comments
        </div>
      </div>

      <div className={`data-panel ${activeTab === 'overview' ? 'active' : ''}`}>
        <div className="card">
          <h3>File Information</h3>
          {data.overview && (
            <div>
              <p><strong>Name:</strong> {data.overview.name}</p>
              <p><strong>Last Modified:</strong> {new Date(data.overview.lastModified).toLocaleString()}</p>
              <p><strong>Version:</strong> {data.overview.version}</p>
              <p><strong>Thumbnail URL:</strong> {data.overview.thumbnailUrl}</p>
              <p><strong>Schema Version:</strong> {data.overview.schemaVersion}</p>
              
              <h4 className="mt-4">Document Structure</h4>
              
              {isLargeDocument && (
                <div className="card" style={{ backgroundColor: 'var(--bg-darker)', marginBottom: '1rem' }}>
                  <p className="text-error">
                    <i className="ri-alert-line"></i> Large document detected ({Math.round(documentSize / 1024 / 1024 * 10) / 10} MB)
                  </p>
                  <p>Displaying the full document structure may cause performance issues.</p>
                  
                  {!showFullDocument ? (
                    <button 
                      className="mt-4"
                      style={{ backgroundColor: 'var(--error)' }}
                      onClick={() => setShowFullDocument(true)}
                    >
                      <i className="ri-eye-line"></i> Show Full Document Structure Anyway
                    </button>
                  ) : (
                    <button 
                      className="mt-4"
                      onClick={() => setShowFullDocument(false)}
                    >
                      <i className="ri-eye-off-line"></i> Hide Full Document Structure
                    </button>
                  )}
                </div>
              )}
              
              {(!isLargeDocument || showFullDocument) && (
                <div className="json-container">
                  <JsonViewer 
                    data={data.overview.document}
                    initialExpansionDepth={1}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {data.user && (
          <div className="card">
            <h3>User Information</h3>
            <p><strong>ID:</strong> {data.user.id}</p>
            <p><strong>Email:</strong> {data.user.email}</p>
            <p><strong>Handle:</strong> {data.user.handle}</p>
            <p><strong>Image URL:</strong> {data.user.img_url}</p>
          </div>
        )}
      </div>

      <div className={`data-panel ${activeTab === 'components' ? 'active' : ''}`}>
        {loading.components ? (
          <div className="flex items-center gap-4">
            <div className="loader"></div>
            <p>Loading components...</p>
          </div>
        ) : error.components ? (
          <div className="card">
            <p className="text-error">{error.components}</p>
          </div>
        ) : data.components ? (
          <div className="card">
            <h3>Components</h3>
            {data.components.meta?.components?.length > 0 ? (
              <div>
                <p>Found {data.components.meta.components.length} components in this file.</p>
                <div className="component-library">
                  {data.components.meta.components.slice(0, 100).map(component => (
                    <div key={component.key} className="component-item">
                      <div className="component-info">
                        <h4>{component.name}</h4>
                        <p className="text-secondary">ID: {component.key}</p>
                        <div className="badge">{component.description || 'No description'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {data.components.meta.components.length > 100 && (
                  <p className="text-secondary mt-4">
                    Showing 100 of {data.components.meta.components.length} components.
                  </p>
                )}
              </div>
            ) : (
              <p>No components found in this file.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className={`data-panel ${activeTab === 'styles' ? 'active' : ''}`}>
        {loading.styles ? (
          <div className="flex items-center gap-4">
            <div className="loader"></div>
            <p>Loading styles...</p>
          </div>
        ) : error.styles ? (
          <div className="card">
            <p className="text-error">{error.styles}</p>
          </div>
        ) : data.styles ? (
          <div className="card">
            <h3>Styles</h3>
            {data.styles.meta?.styles?.length > 0 ? (
              <div>
                <p>Found {data.styles.meta.styles.length} styles in this file.</p>
                <div className="grid">
                  {data.styles.meta.styles.slice(0, 100).map(style => (
                    <div key={style.key} className="card">
                      <h4>{style.name}</h4>
                      <p><strong>Type:</strong> {style.style_type}</p>
                      <p><strong>ID:</strong> {style.key}</p>
                      <p><strong>Description:</strong> {style.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
                {data.styles.meta.styles.length > 100 && (
                  <p className="text-secondary mt-4">
                    Showing 100 of {data.styles.meta.styles.length} styles.
                  </p>
                )}
              </div>
            ) : (
              <p>No styles found in this file.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className={`data-panel ${activeTab === 'images' ? 'active' : ''}`}>
        {loading.images ? (
          <div className="flex items-center gap-4">
            <div className="loader"></div>
            <p>Loading images...</p>
          </div>
        ) : error.images ? (
          <div className="card">
            <p className="text-error">{error.images}</p>
          </div>
        ) : data.images ? (
          <div className="card">
            <h3>Images</h3>
            {Object.keys(data.images.images || {}).length > 0 ? (
              <div>
                <p>Found {Object.keys(data.images.images).length} images in the file.</p>
                
                <div className="mt-4">
                  <JsonViewer 
                    data={data.images}
                    initialExpansionDepth={1}
                  />
                </div>
              </div>
            ) : (
              <p>No images found in this file.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className={`data-panel ${activeTab === 'comments' ? 'active' : ''}`}>
        {loading.comments ? (
          <div className="flex items-center gap-4">
            <div className="loader"></div>
            <p>Loading comments...</p>
          </div>
        ) : error.comments ? (
          <div className="card">
            <p className="text-error">{error.comments}</p>
          </div>
        ) : data.comments ? (
          <div className="card">
            <h3>Comments</h3>
            {data.comments.comments?.length > 0 ? (
              <div>
                <p>Found {data.comments.comments.length} comments in this file.</p>
                {data.comments.comments.slice(0, 50).map(comment => (
                  <div key={comment.id} className="card mb-4">
                    <div className="flex justify-between">
                      <h4>{comment.user.handle}</h4>
                      <span className="text-secondary">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p>{comment.message}</p>
                    {comment.resolved_at && (
                      <p className="text-success">
                        <i className="ri-check-line"></i> Resolved
                      </p>
                    )}
                  </div>
                ))}
                {data.comments.comments.length > 50 && (
                  <p className="text-secondary">
                    Showing 50 of {data.comments.comments.length} comments.
                  </p>
                )}
              </div>
            ) : (
              <p>No comments found in this file.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FigmaDataDisplay;
