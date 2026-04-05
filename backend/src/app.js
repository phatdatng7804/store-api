import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";

// Global Mongoose toJSON transform: _id → id, remove __v
mongoose.set("toJSON", {
    virtuals: true,
    transform: (doc, converted) => {
        converted.id = converted._id;
        delete converted._id;
        delete converted.__v;
    }
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));


app.use("/api", routes);

app.use(errorHandler);

export default app;