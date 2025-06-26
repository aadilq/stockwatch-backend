require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT;
const URI = process.env.MONGO_DB_URI

mongoose.connect(URI)
  .then(() => console.log('Connected to MongoDB Database'))
  .catch(err => console.log('Could not connect to MongoDB...', err));


const stockSchema = new mongoose.Schema({
    company: String, 
    description: String,
    initial_price: String,
    price_2002: Number, 
    price_2007: Number, 
    symbol: String
});

const Stock = mongoose.model("Stock", stockSchema, "stocks");

//Test function to verify if the data exists
async function testConnection () {
    try{
        const count = await Stock.countDocuments();
        console.log(`Found ${count} documents in the stock collection`);

        //Get a sample document
        const sample = await Stock.findOne();
        console.log('Sample document: ', sample);
    }
    catch(error){
        console.error('Error testing connection:', error);
    }
}

testConnection();

app.get("/api/stocks", async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks); //Send a JSON response back to the client
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
    
})

app.post("/api/watchlist", async (req, res) => {
    try {
        const{
            company, 
            description,
            initial_price,
            price_2002,
            price_2007,
            symbol, 
        } = req.body;
        const stock = new Stock({
            company, 
            description,
            initial_price,
            price_2002,
            price_2007,
            symbol, 
        });
        await stock.save();
        res.json({message: "Stock added to watchlist successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);

