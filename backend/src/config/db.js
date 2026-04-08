import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;
if(!mongoUri){
    throw new Error("MONGODB_URI is required");
}

// Configure global toJSON transform to convert _id to id and remove __v
mongoose.set('toJSON', {
    transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
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