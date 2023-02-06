const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("resale server is running");
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4jbx8gf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const dbConnect = async () => {
    await client.connect();
}
dbConnect().catch(e => console.log(e))


const categoriesCollection = client.db("resale").collection("categories");
const booksCollection = client.db("resale").collection("books");

app.get('/Categories', async (req, res) => {
    try {
        const query = {};
        const result = await categoriesCollection.find(query).toArray();
        return res.send(result);
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})

app.get('/CategoryBooks/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { category_id: id };
        const result = await booksCollection.find(query).toArray();
        // console.log(res,id,query);
        res.send(result);
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})



app.listen(port, () => {
    console.log(`resale server is running on port: ${port}`);
})