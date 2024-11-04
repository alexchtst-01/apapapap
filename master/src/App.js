import React, { useState } from "react";
import Dropdown from "./dropdown";
import GraphContainer from "./graphcontainer";
import CameraView from "./cameraview";
import SegmentedButton from "./segmentedbutton";
import WarningLog from "./warninglog";
import "./app.css";
import axios from "axios";
import GraphContainer2 from "./graphcontainer2";
import GraphContainer3 from "./graphcontainer3";

axios.defaults.withCredentials = true;

const App = () => {
  const [selectedArea, setSelectedArea] = useState("AreaX");
  const [selectedCondition, setSelectedCondition] = useState("Temperature");
  const [warning, setWarning] = useState("");

  // Handler for area selection
  const handleAreaChange = (area) => {
    setSelectedArea(area);
  };

  // Handler for segmented button
  const handleConditionChange = (condition) => {
    setSelectedCondition(condition);
  };

  return (
    <div className="app-container">
      <div className="left-column">
        <Dropdown selectedArea={selectedArea} onAreaChange={handleAreaChange} />
        <div className={`${selectedArea !== "AreaX" ? "hidden" : ""}`}>
          <GraphContainer />
        </div>
        <div className={`${selectedArea !== "AreaY" ? "hidden" : ""}`}>
          <GraphContainer2 />
        </div>{" "}
        <div className={`${selectedArea !== "AreaZ" ? "hidden" : ""}`}>
          <GraphContainer3 />
        </div>
        {/* {selectedArea} */}
      </div>
      <div className="right-column">
        <CameraView />
        <SegmentedButton
          selectedCondition={selectedCondition}
          onConditionChange={handleConditionChange}
        />
        <WarningLog warning={warning} />
      </div>
    </div>
  );
};

export default App;
