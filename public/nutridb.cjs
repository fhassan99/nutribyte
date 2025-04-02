const express = require("express");
const router = express.Router();
const mongoose = require("./nutridbconn.cjs");
const numberInt = require("mongoose-int32");

//Make sure that the datatypes here match with datatypes in MongoDB
const branded_food_schema = new mongoose.Schema({
    fdcId: String,
    description: String,
    brandOwner: String,
    marketCountry: String,
    gtinUpc: String,
    ingredients: String,
    servingSize: { type: Number },
    servingSizeUnit: String,
    householdServingFullText: String,
    brandedFoodCategory: String,
    publicationDate: String
}, {collection: "branded_food"});

const Food = mongoose.model("Food", branded_food_schema);

// Test for GET request 
router.get("/hello", function (req, res) {
   res.send("<h1>Hello, Mongodb!</h1>");
});

// Test for MongoDB connectivity 
router.get("/food", async function(req, res) {
    try {
        const searchString  = req.query.searchString || "";
        
        const food = await Food.find({
         description: {"$regex": searchString, "$options": 'i'}}); 
         console.log(food.length);
        if (!food) {
            return res.send("<h2>No documents found</h2>");
        } else {

         let html = `
         <h2>Search Results for "${searchString}"</h2>
         <ul>
     `;

     food.forEach(item => {
         html += `
             <li>
                 <strong>${item.fdcId}</strong>: ${item.description}
             </li>
         `;
     });

     html += `</ul><br><a href="/">Search again</a>`;
        res.send(html);
        }

    } catch (e) {
        res.status(400).send(e.message);
    }
});


 module.exports = router;