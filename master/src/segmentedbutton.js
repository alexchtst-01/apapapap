import React from 'react';

const SegmentedButton = ({ selectedCondition, onConditionChange }) => {
  const conditions = ['Temperature', 'Humidity', 'Gas'];

  return (
    <div className="segmented-button">
      {conditions.map((condition) => (
        <button
          key={condition}
          className={selectedCondition === condition ? 'active' : ''}
          onClick={() => onConditionChange(condition)}
        >
          {condition}
        </button>
      ))}
    </div>
  );
};

export default SegmentedButton;
