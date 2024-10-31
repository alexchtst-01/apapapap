import React from "react";
import LineChart from "./lineplot";

const GraphContainer = ({ area }) => {
  // Placeholder for dynamic graphs
  return (
    <div className="graph-container">
      <div className="graph">
        <LineChart />
      </div>
      <div className="graph">
        <LineChart />
      </div>
      <div className="graph">
        <LineChart />
      </div>
    </div>
  );
};

export default GraphContainer;
