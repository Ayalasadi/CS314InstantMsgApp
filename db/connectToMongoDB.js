import mongoose from 'mongoose';

let MONGO_DB_URI="mongodb+srv://kenr:zvcIoXe9mA64TOWR@cluster0.smaezbf.mongodb.net/chat-ap-db?retryWrites=true&w=majority&appName=Cluster0";

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_DB_URI);
        console.log("Connected to MongoDB");
    } catch (error){
        console.log("Error connecting to MongoDB", error.message);
    }
};

export { connectToMongoDB };
