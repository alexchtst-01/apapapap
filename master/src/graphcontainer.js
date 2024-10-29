import React from 'react';

const GraphContainer = ({ area }) => {
  // Placeholder for dynamic graphs
  return (
    <div className="graph-container">
      <div className="graph">
        <p>{`Temperature graph for ${area}`}</p>
      </div>
      <div className="graph">
        <p>{`Humidity graph for ${area}`}</p>
      </div>
      <div className="graph">
        <p>{`Gas level graph for ${area}`}</p>
      </div>
    </div>
  );
};

export default GraphContainer;
