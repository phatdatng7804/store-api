import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;
if(!mongoUri){
    throw new Error("MONGODB_URI is required");
}
const connectDB = async () => {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
};
const disconnectDB = async () => {
    if(mongoose.connection.readyState === 1){
         await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
};  
export {connectDB, disconnectDB};