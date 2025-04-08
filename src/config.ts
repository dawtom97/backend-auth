import dotenv from "dotenv";
dotenv.config();

// eksport nazwany
export const config = {
    port: process.env.PORT,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET
}

