//this is a library used to connect Node with MongoDB.
import mongoose from 'mongoose';
//a package used to load environment variables from a .env file.
import dotenv from "dotenv"
//activates dotenv
dotenv.config();
//This gets the database URL from environment variables. process.env = all environment variables,MONGO_URL = variable name you defined in .env
 const MONGO_URL = process.env.MONGO_URL
//Check if URL exists
if (!MONGO_URL) {
console.log('MONGO_URL is not defined');
}
//creating async function and export it to use it, async → because database connection takes time (it uses await)

 export async function start() {
// Try block (safe execution), code inside the try-catch block runs normaly
  try {
//Connect to MongoDB- this is the most important line, this will connect the mongodb with the app
//await means: wait until connection is successful
    await mongoose.connect(MONGO_URL);
//success message
    console.log('Database connected');
//If anything fails inside try, this block runs.
  }catch(err){
console.log("error conntecting db",err)
  }
}
