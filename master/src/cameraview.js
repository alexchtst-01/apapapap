import React from 'react';

const CameraView = () => {
  return (
    <div className="camera-view">
      {/* Mengambil stream hasil deteksi dari backend Flask */}
      <img
        src="http://localhost:5000/video_feed"
        alt="Deteksi Roboflow"
        className="camera-stream"
      />
    </div>
  );
};

export default CameraView;
