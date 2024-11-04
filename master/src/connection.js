import axios from "axios";
import env from "react-dotenv";

const END_POINT = env.LOCAL_ENDPOINT || env.HOSTED_ENDPOINT;

export const postData = async (data) => {
  console.log(data);
  try {
    const response = await axios.post(
      `${END_POINT}/data`,
      {
        humidity:data.humi,
        temp:data.temp,
        gas:data.gas,
        device:data.device,
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
