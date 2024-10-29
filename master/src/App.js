import React, { useState } from 'react';
import Dropdown from './dropdown';
import GraphContainer from './graphcontainer';
import CameraView from './cameraview';
import SegmentedButton from './segmentedbutton';
import WarningLog from './warninglog';
import './app.css';

const App = () => {
  const [selectedArea, setSelectedArea] = useState('Area X');
  const [selectedCondition, setSelectedCondition] = useState('Temperature');
  const [warning, setWarning] = useState('');

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
        <GraphContainer area={selectedArea} />
      </div>
      <div className="right-column">
        <CameraView />
        <SegmentedButton selectedCondition={selectedCondition} onConditionChange={handleConditionChange} />
        <WarningLog warning={warning} />
      </div>
    </div>
  );
};

export default App;



