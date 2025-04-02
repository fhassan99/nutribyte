   
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI || "mongodb+srv://fhassan99:Kingkobe24!@cluster0.roacd9a.mongodb.net/";

try {
    mongoose.connect(uri);
    console.log("Connected to Mongodb");
} catch (e) {
    console.log(e)
    console.log("Mongodb connection failed")
}

module.exports =  mongoose;