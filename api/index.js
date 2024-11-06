import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();

const dataResult = new mongoose.Schema(
  {
    humidity: {
      type: Number,
      required: true,
    },
    temp: {
      type: Number,
      required: true,
    },
    gas: {
      type: Number,
      required: true,
    },
    device: {
      type: Number,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Data = mongoose.model("data", dataResult);

const postData = async (req, res) => {
  const { humidity, temp, gas, device, region } = req.body;
  try {
    const newData = new Data({ humidity, temp, gas, device, region });
    await newData.save();
    res
      .status(201)
      .json({ message: "Data posted successfully", data: newData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to post data", error: error.message });
  }
};

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // Set to your frontend URL
    credentials: true,
  })
);

app.use(express.json());

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello from backend");
});

app.use(morgan("dev"));

app.use("/", router);

router.post("/data", postData);

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONN_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

connectDB();