import React from 'react';

const WarningLog = ({ warning }) => {
  return (
    <div className="warning-log">
      {warning ? <p>{warning}</p> : <p>(warning akan ditampilkan disini jika ada)</p>}
    </div>
  );
};

export default WarningLog;
