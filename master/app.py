import os
import cv2
import base64
from flask import Flask
from flask_socketio import SocketIO
from inference import InferencePipeline
from PIL import Image
from io import BytesIO

# Setup Flask and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Environment variable for API key and database URL
API_KEY = os.environ.get("ROBOFLOW_API_KEY")
DATABASE_API_URL = os.environ.get("DATABASE_API_URL")

# Hardcoded values
VIDEO_REFERENCE = 0
WORKSPACE_NAME = "yasmine-1so7p"
WORKFLOW_ID = "timezone-3-3"

def main() -> None:
    # Initialize the inference pipeline
    pipeline = InferencePipeline.init_with_workflow(
        api_key=API_KEY,
        workspace_name=WORKSPACE_NAME,
        video_reference=VIDEO_REFERENCE,
        on_prediction=my_sink,
        workflow_id=WORKFLOW_ID,
        max_fps=30,
    )
    print("Starting the inference pipeline...")
    pipeline.start()

def my_sink(result, video_frame):
    try:
        # Get visualizations for display
        frame_1 = result.get("frame_1", None)
        frame_2 = result.get("frame_2", None)

        if frame_1:
            frame_1 = cv2.cvtColor(frame_1.numpy_image, cv2.COLOR_BGR2RGB)
        if frame_2:
            frame_2 = cv2.cvtColor(frame_2.numpy_image, cv2.COLOR_BGR2RGB)

        # Convert and send each frame to the frontend
        if frame_1 is not None:
            pil_image_1 = Image.fromarray(frame_1)
            buffered_1 = BytesIO()
            pil_image_1.save(buffered_1, format="JPEG")
            img_str_1 = base64.b64encode(buffered_1.getvalue()).decode("utf-8")
            socketio.emit('frame_1', img_str_1)

        if frame_2 is not None:
            pil_image_2 = Image.fromarray(frame_2)
            buffered_2 = BytesIO()
            pil_image_2.save(buffered_2, format="JPEG")
            img_str_2 = base64.b64encode(buffered_2.getvalue()).decode("utf-8")
            socketio.emit('frame_2', img_str_2)

    except Exception as e:
        import traceback
        print(f"Error in my_sink: {e}")
        traceback.print_exc()

if __name__ == '__main__':
    # Start the inference pipeline as a background task
    socketio.start_background_task(target=main)
    # Run the Flask app with Socket.IO
    socketio.run(app, port=5000)
