import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './styles.css';

const socket = io('http://localhost:5000');

const CameraView = () => {
  const [frame1, setFrame1] = useState('');
  const [frame2, setFrame2] = useState('');
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);

  useEffect(() => {
    // Get frames from backend
    socket.on('frame_1', (data) => {
      setFrame1(`data:image/jpeg;base64,${data}`);
    });

    socket.on('frame_2', (data) => {
      setFrame2(`data:image/jpeg;base64,${data}`);
    });

    return () => {
      socket.off('frame_1');
      socket.off('frame_2');
    };
  }, []);

  useEffect(() => {
    if (frame1 && canvasRef1.current) {
      const canvas = canvasRef1.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = frame1;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [frame1]);

  useEffect(() => {
    if (frame2 && canvasRef2.current) {
      const canvas = canvasRef2.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = frame2;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, [frame2]);

  return (
    <div className="container">
      <h1 className="title">Live Camera Stream with Frames</h1>
      <div className="camera-view-wrapper">
        {/* Canvas for frame_1 with red border */}
        <div className="frame-container frame-red">
          <canvas ref={canvasRef1} className="camera-canvas" />
        </div>
        {/* Canvas for frame_2 with blue border */}
        <div className="frame-container frame-blue">
          <canvas ref={canvasRef2} className="camera-canvas" />
        </div>
      </div>
    </div>
  );
};

export default CameraView;
