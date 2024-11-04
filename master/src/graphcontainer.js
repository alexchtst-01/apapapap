import React from "react";
import LineChart from "./lineplot";

const GraphContainer = ({ area }) => {
  // Placeholder for dynamic graphs
  return (
    <div className="graph-container">
      <LineChart area={area}/>
    </div>
  );
};

export default GraphContainer;
