import React, { useState, useMemo } from 'react';
import './WaterSystemDirectory.css';
import waterSystemsData from '../data/waterSystemsData';

function WaterSystemDirectory({ data = waterSystemsData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('leadLines');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterExceedances, setFilterExceedances] = useState(false);
  
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(system => 
      system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      system.pwsid.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filterExceedances) {
      filtered = filtered.filter(system => system.exceedance && system.exceedance !== '' && system.exceedance !== '-');
    }
    
    // Only show systems with lines to replace
    filtered = filtered.filter(system => system.totalToReplace > 0);
    
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [data, searchTerm, sortField, sortDirection, filterExceedances]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const getProgressColor = (percent) => {
    if (percent >= 75) return '#16a34a';
    if (percent >= 50) return '#84cc16';
    if (percent >= 25) return '#eab308';
    if (percent >= 10) return '#f97316';
    return '#dc2626';
  };
  
  const getProgressLabel = (percent) => {
    if (percent >= 75) return 'Excellent';
    if (percent >= 50) return 'Good';
    if (percent >= 25) return 'Fair';
    if (percent >= 10) return 'Poor';
    return 'Critical';
  };
  
  return (
    <div className="directory-container">
      <div className="directory-header">
        <h1>Michigan Water System Directory</h1>
        <p>Search for your water system to see lead service line data</p>
      </div>
      
      <div className="search-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by city or water system name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filterExceedances}
              onChange={(e) => setFilterExceedances(e.target.checked)}
            />
            <span>Show only systems with lead action level exceedances</span>
          </label>
        </div>
        
        <div className="results-count">
          Showing {filteredAndSortedData.length} systems
        </div>
      </div>

      <div className="sort-controls">
        <span className="sort-label">Sort by:</span>
        <button 
          className={`sort-btn ${sortField === 'name' ? 'active' : ''}`}
          onClick={() => handleSort('name')}
        >
          Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-btn ${sortField === 'leadLines' ? 'active' : ''}`}
          onClick={() => handleSort('leadLines')}
        >
          Lead Lines {sortField === 'leadLines' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-btn ${sortField === 'population' ? 'active' : ''}`}
          onClick={() => handleSort('population')}
        >
          Population {sortField === 'population' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          className={`sort-btn ${sortField === 'percentReplaced' ? 'active' : ''}`}
          onClick={() => handleSort('percentReplaced')}
        >
          Progress {sortField === 'percentReplaced' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
      </div>
      
      <div className="systems-grid">
        {filteredAndSortedData.length === 0 ? (
          <div className="no-results">
            <p>No systems found matching "{searchTerm}"</p>
            <p className="hint">Try searching for a city name like "Detroit" or "Grand Rapids"</p>
          </div>
        ) : (
          filteredAndSortedData.map((system) => (
            <div key={system.pwsid} className="system-card">
              <div className="card-header">
                <h3>{system.name}</h3>
                {system.exceedance && system.exceedance !== '-' && (
                  <span className="exceedance-badge" title={`Lead action level exceeded in ${system.exceedance}`}>
                    ⚠️ Exceedance
                  </span>
                )}
              </div>
              
              <div className="card-body">
                <div className="stat-row">
                  <span className="stat-label">Population Served</span>
                  <span className="stat-value">{system.population.toLocaleString()}</span>
                </div>
                
                <div className="stat-row highlight">
                  <span className="stat-label">Known Lead Lines</span>
                  <span className="stat-value large">{system.leadLines.toLocaleString()}</span>
                </div>
                
                <div className="stat-row">
                  <span className="stat-label">Lines Replaced</span>
                  <span className="stat-value">{system.totalReplaced.toLocaleString()}</span>
                </div>
                
                {system.gpcl > 0 && (
                  <div className="stat-row warning">
                    <span className="stat-label">Galvanized (GPCL)</span>
                    <span className="stat-value">{system.gpcl.toLocaleString()}</span>
                  </div>
                )}
                
                {system.unknown > 0 && (
                  <div className="stat-row warning">
                    <span className="stat-label">Unknown Material</span>
                    <span className="stat-value">{system.unknown.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="stat-row">
                  <span className="stat-label">Total to be Identified and/or Replaced</span>
                  <span className="stat-value">{system.totalToReplace.toLocaleString()}</span>
                </div>
                
                {system.exceedance && system.exceedance !== '-' && (
                  <div className="stat-row" style={{background: '#fef2f2', margin: '10px -20px', padding: '12px 20px'}}>
                    <span className="stat-label">Most Recent Lead Action Level Exceedance</span>
                    <span className="stat-value" style={{color: '#dc2626'}}>{system.exceedance}</span>
                  </div>
                )}
                
                <div className="progress-section">
                  <div className="progress-label-row">
                    <span className="progress-label">Replacement Progress</span>
                    <span className="progress-percent">{system.percentReplaced.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div 
                      className="progress-bar-inner"
                      style={{ 
                        width: `${Math.min(system.percentReplaced, 100)}%`,
                        backgroundColor: getProgressColor(system.percentReplaced)
                      }}
                    />
                  </div>
                  <div className="progress-status" style={{ color: getProgressColor(system.percentReplaced) }}>
                    {getProgressLabel(system.percentReplaced)} Progress
                  </div>
                </div>
                
                <div className="card-footer">
                  <span className="pwsid">ID: {system.pwsid}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WaterSystemDirectory;