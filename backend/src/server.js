import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 3000;

export const startServer = async () =>{
    try{
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch(error){
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

startServer();