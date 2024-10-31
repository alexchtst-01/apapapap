import React from "react";
import LineChart from "./lineplot";

const GraphContainer = ({ area }) => {
  // Placeholder for dynamic graphs
  return (
    <div className="graph-container">
      <div className="graph">
        <LineChart>
          temp2
        </LineChart>
      </div>
      <div className="graph">
        <LineChart>
          hum2
        </LineChart>
      </div>
      <div className="graph">
        <LineChart>
          gas2
        </LineChart>
      </div>
    </div>
  );
};

export default GraphContainer;
