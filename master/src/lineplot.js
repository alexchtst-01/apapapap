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
import { postData } from "./connection";

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

const LineChart = () => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [gasData, setGasData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [time, setTime] = useState(0);

  const conn = `/ThinkIOT/data`;
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
      console.log(data);
      if (topic === conn) {
        if (data.Temp) {
          setTemperatureData((prevData) => {
            const newDataTemp = [...prevData, data.Temp];
            if (newDataTemp.length > 25) {
              newDataTemp.shift();
            }
            return newDataTemp;
          });
        }
        if (data.Hum) {
          setHumidityData((prevData) => {
            const newDataHum = [...prevData, data.Hum];
            if (newDataHum.length > 25) {
              newDataHum.shift();
            }
            return newDataHum;
          });
        }
        if (data.Gas) {
          setGasData((prevData) => {
            const newDataGas = [...prevData, data.Gas];
            if (newDataGas.length > 25) {
              newDataGas.shift();
            }
            return newDataGas;
          });
        }

        console.log(`temp: ${data.Temp}`);
        console.log(`hum: ${data.Hum}`);
        console.log(`gas: ${data.Gas}`);

        setLabels((prevLabels) => {
          const newLabels = [...prevLabels, ` ${time}`];
          if (newLabels.length > 7) {
            newLabels.shift();
          }
          return newLabels;
        });

        postData({
          humi: data.Hum,
          temp: data.Temp,
          gas: data.Gas,
          device: 2,
          region: "Area X",
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

  const dataTemp = {
    labels: labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatureData,
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
      },
    ],
  };

  const dataHum = {
    labels: labels,
    datasets: [
      {
        label: "Humidity (%)",
        data: humidityData,
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
      },
    ],
  };

  const dataGas = {
    labels: labels,
    datasets: [
      {
        label: "Gas",
        data: gasData,
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
        text: "",
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
          text: "",
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
    <div className="graph-container">
      <div className="graph">
        <div style={{ background: "black" }}>
          <Line data={dataTemp} options={options} />
        </div>
      </div>
      <div className="graph">
        <div style={{ background: "black" }}>
          <Line data={dataHum} options={options} />
        </div>
      </div>
      <div className="graph">
        <div style={{ background: "black" }}>
          <Line data={dataGas} options={options} />
        </div>
      </div>
    </div>
  );
};

export default LineChart;
