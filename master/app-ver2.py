import os
import cv2
import base64
import json
import requests
import numpy as np
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

def transform_time_zone_data(result):
    transformed_data = []
    
    # Helper function to process data from a specific zone
    def process_zone_data(zone_data, zone_id):
        if zone_data and hasattr(zone_data, "data") and zone_data.data:
            data = zone_data.data
            
            # Retrieve detection_id and handle various data types
            tracker_id = data["detection_id"]
            if isinstance(tracker_id, np.ndarray):
                tracker_id = tracker_id[0]
            elif isinstance(tracker_id, list):
                tracker_id = tracker_id[0]
            
            # Strip unwanted characters if tracker_id is a string
            if isinstance(tracker_id, str):
                tracker_id = tracker_id.strip("[]'")
            
            # Retrieve time_in_zone and convert to float
            time_value = data["time_in_zone"]
            if isinstance(time_value, np.ndarray):
                time_value = float(time_value[0])
            elif isinstance(time_value, list):
                time_value = float(time_value[0])
            elif isinstance(time_value, str):
                time_value = float(time_value.strip("[]"))
            else:
                time_value = float(time_value)
            
            transformed_item = {
                "tracker_id": tracker_id,
                "zone_id": zone_id,
                "time_in_zone": time_value
            }
            transformed_data.append(transformed_item)
    
    # Process time_in_zone data (zone_id = 0)
    if "time_in_zone" in result:
        process_zone_data(result["time_in_zone"], 0)
    
    # Process time_in_zone_1 data (zone_id = 1)
    if "time_in_zone_1" in result:
        process_zone_data(result["time_in_zone_1"], 1)
    
    return transformed_data

def my_sink(result, video_frame):
    print("\nmy_sink called...")  # Log start of function

    # Display image if output_image is present
    if result.get("output_image"):
        print("Displaying output image...")
        cv2.imshow("Workflow Image", result["output_image"].numpy_image)
        cv2.waitKey(1)

    # Check and display original data from 'time_in_zone' if available
    if "time_in_zone" in result and hasattr(result["time_in_zone"], "data"):
        print("Checking 'time_in_zone' data...")
        time_in_zone_data = result["time_in_zone"].data
        if time_in_zone_data:
            print("\nOriginal Data from 'time_in_zone':")
            print(json.dumps(time_in_zone_data, indent=4, default=str))
        else:
            print("\nData from 'time_in_zone' is empty.")
    else:
        print("'time_in_zone' not found in result.")

    # Check and display original data from 'time_in_zone_1' if available
    if "time_in_zone_1" in result and hasattr(result["time_in_zone_1"], "data"):
        print("Checking 'time_in_zone_1' data...")
        time_in_zone_1_data = result["time_in_zone_1"].data
        if time_in_zone_1_data:
            print("\nOriginal Data from 'time_in_zone_1':")
            print(json.dumps(time_in_zone_1_data, indent=4, default=str))
        else:
            print("\nData from 'time_in_zone_1' is empty.")
    else:
        print("'time_in_zone_1' not found in result.")

    # Transform data and display transformed results
    try:
        print("Attempting to transform data...")
        transformed_data = transform_time_zone_data(result)
        if transformed_data:
            print("\nTransformed Data:")
            print(json.dumps(transformed_data, indent=4))
            print("-" * 50)  # Separator for easier output reading

            # Send combined data to backend
            api_url = os.environ.get("HOSTED_ENDPOINT")  # Retrieve the API URL from environment variable
            print("Sending transformed data to backend...")
            response = requests.post(f"{api_url}/tracking", json={"predictions": transformed_data})
            response.raise_for_status()
            print(f"Tracking data sent successfully: {response.status_code}")
            print("Payload:", transformed_data)
        else:
            print("No data to transform.")
    except Exception as e:
        print(f"\nError during data transformation or payload submission: {str(e)}")

if __name__ == '__main__':
    # Start the inference pipeline as a background task
    socketio.start_background_task(target=main)
    # Run the Flask app with Socket.IO
    socketio.run(app, port=5000)
