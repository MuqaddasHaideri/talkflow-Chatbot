import express from "express";
import {start} from "./db/dbStart.js"
const app = express();

const PORT = process.env.PORT || 5000;
 
// app.get('/endPoint', (req, res) => {
//     res.send('Hello World!')
//   })

start ()
app.listen(PORT ,() => {
    console.log(`Server is running on port ${PORT}`);
});

