from flask import Flask, Response
from flask_cors import CORS
from inference import InferencePipeline
import cv2

app = Flask(__name__)
CORS(app)  # Mengaktifkan CORS agar bisa diakses oleh frontend

def my_sink(result, video_frame):
    if result.get("output_image"):
        visualization = result["output_image"].numpy_image
        _, buffer = cv2.imencode('.jpg', visualization)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    else:
        print("No output from the workflow")

# Inisialisasi pipeline inferensi
pipeline = InferencePipeline.init_with_workflow(
    api_key="EEluxW7iF5IQsvezHGTm",
    workspace_name="yasmine-1so7p",
    workflow_id="custom-workflow",
    video_reference=0,  # Menggunakan webcam lokal
    max_fps=30,
    on_prediction=None
)

@app.route('/video_feed')
def video_feed():
    def generate_frames():
        while True:
            result = pipeline.consume_result()
            if result and result.get("outputs"):
                visualization = result["outputs"][0]["output_image"].numpy_image
                _, buffer = cv2.imencode('.jpg', visualization)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    pipeline.start()  # Memulai pipeline
    app.run(host='0.0.0.0', port=5000)  # Menjalankan server Flask
