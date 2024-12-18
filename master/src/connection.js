import axios from "axios";
import env from "react-dotenv";

const END_POINT = env.HOSTED_ENDPOINT;
axios.defaults.withCredentials = true;
export const postData = async (data) => {
  console.log(data);
  console.log(END_POINT);
  try {
    const response = await axios.post(
      `${END_POINT}/data`,
      {
        humidity:data.humi,
        temp:data.temp,
        gas:data.gas,
        device:data.device,
        region: data.region,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
  } catch (error) {
    console.log(`occured error ${error}`);
  }
};