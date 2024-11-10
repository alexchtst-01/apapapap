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

const LineChart = ({area}) => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [mq2Data, setMq2Data] = useState([]);
  const [mq3Data, setMq3Data] = useState([]);
  const [mq135Data, setMq135Data] = useState([]);
  const [labels, setLabels] = useState([]);
  const [time, setTime] = useState(0);

  const conn = `/ThinkIOT/data/${area}`;
  console.log(area)
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
    
        if (data.MQ2) {
          setMq2Data((prevData) => {
            const newDataMq2 = [...prevData, data.MQ2];
            if (newDataMq2.length > 25) {
              newDataMq2.shift();
            }
            return newDataMq2;
          });
        }
    
        if (data.MQ3) {
          setMq3Data((prevData) => {
            const newDataMq3 = [...prevData, data.MQ3];
            if (newDataMq3.length > 25) {
              newDataMq3.shift();
            }
            return newDataMq3;
          });
        }
    
        if (data.MQ135) {
          setMq135Data((prevData) => {
            const newDataMq135 = [...prevData, data.MQ135];
            if (newDataMq135.length > 25) {
              newDataMq135.shift();
            }
            return newDataMq135;
          });
        }
    
        console.log(`temp: ${data.Temp}`);
        console.log(`hum: ${data.Hum}`);
        console.log(`gas: ${data.MQ2}`);
        console.log(`gas: ${data.MQ3}`);
        console.log(`gas: ${data.MQ135}`);
    
        setLabels((prevLabels) => {
          const newLabels = [...prevLabels, ` ${time}`];
          if (newLabels.length > 7) {
            newLabels.shift();
          }
          return newLabels;
        });
    
        postData({
          id: data.ID,
          humi: data.Hum,
          temp: data.Temp,
          mq2: data.MQ2,
          mq3: data.MQ3,
          mq135: data.MQ135,
          region: area,
        });
    
        setTime((prevTime) => prevTime + 1);
      }
    });
    

    // Clean up connection on unmount
    return () => {
      if (client) {
        // client.unsubscribe(conn);
        client.end();
      }
    };
  }, [area, time]);

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
        data: [mq2Data, mq3Data, mq135Data],
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
