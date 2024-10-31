import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import mqtt from "mqtt";

// Register the components to ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ children }) => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [time, setTime] = useState(0);

  const conn = `/ThinkIOT/${children}`;
  useEffect(() => {
    const client = mqtt.connect("wss://test.mosquitto.org:8081");
    client.on("connect", () => {
      console.log("Connected to Mosquitto broker");
      client.subscribe(conn, (err) => {
        if (err) {
          console.error("Subscription error:", err);
        }
      });
    });

    client.on("message", (topic, message) => {
      const data = JSON.parse(message.toString());
      if (topic === conn) {
        setTemperatureData((prevData) => {
          const newData = [...prevData, data.Temp];
          if (newData.length > 25) {
            newData.shift();
          }
          return newData;
        });

        setLabels((prevLabels) => {
          const newLabels = [...prevLabels, ` ${time}`];
          if (newLabels.length > 7) {
            newLabels.shift();
          }
          return newLabels;
        });
        setTime((prevTime) => prevTime + 1);
      }
    });

    // Clean up connection on unmount
    return () => {
      if (client) {
        client.end();
      }
    };
  }, [time]);

  const data = {
    labels: labels,
    datasets: [
      {
        label: conn.includes("temp")
          ? "Temperature (°C)"
          : conn.includes("hum")
          ? "Humidity"
          : "Gas",
        data: temperatureData,
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 10, // Change this value to set legend font size
          },
        },
      },
      title: {
        display: false,
        text: "Temperature Data Over Time",
        font: {
          size: 12, // Change this value to set title font size
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: false,
          text: "Temperature (°C)",
          font: {
            size: 5,
          },
        },
        ticks: {
          font: {
            size: 8,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
          font: {
            size: 6,
          },
        },
        ticks: {
          font: {
            size: 5, // Change this value to set x-axis ticks font size
          },
        },
      },
    },
  };

  return (
    <div style={{ background: "black" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
