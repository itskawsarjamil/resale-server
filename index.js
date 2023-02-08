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
const usersCollection = client.db("resale").collection("users");
const ordersCollection = client.db("resale").collection("orders");

app.post('/users', async (req, res) => {
    try {
        const data = req.body;
        const uemail = data.email;
        const query = { email: uemail };
        const findResult = await usersCollection.findOne(query);
        // console.log(findRe);
        if (!findResult) {

            const result = await usersCollection.insertOne(data);
            // console.log(result);
            res.send(result);
        }
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})
app.post('/g-users', async (req, res) => {
    try {
        const data = req.body;
        // console.log(data);
        const uemail = data.email;
        const query = { email: uemail };
        const findResult = await usersCollection.findOne(query);
        // console.log(findRe);
        if (!findResult) {

            const result = await usersCollection.insertOne(data);
            // console.log(result);
            res.send(result);
        }
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})

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

app.get('/categoryid', async (req, res) => {
    try {
        const name = req.query.catname;
        const query = { category_name: name }

        const result = await categoriesCollection.findOne(query);

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

app.get("/books", async (req, res) => {
    try {
        const email = req.query.email;
        const query = { seller_email: email };
        const result = await booksCollection.find(query).toArray();
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

app.post("/addbook", async (req, res) => {
    try {
        const data = req.body;
        const result = await booksCollection.insertOne(data);
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

app.get('/sellerDetail', async (req, res) => {
    try {
        const mail = req.query.email;
        const query = { email: mail };

        const result = await usersCollection.findOne(query);

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
app.post('/orders', async (req, res) => {
    try {
        const data = req.body;
        const result = await ordersCollection.insertOne(data);

        res.json(result);
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})

app.get('/orders', async (req, res) => {
    try {
        const email = req.query.email;
        const query = { email };
        // console.log(query);
        const result = await ordersCollection.find(query).toArray();
        // console.log(result);
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

app.get("/buyers", async (req, res) => {
    try {
        const query = { role: "buyer" };
        const result = await usersCollection.find(query).toArray();
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
app.get("/sellers", async (req, res) => {
    try {
        const query = { role: "seller" };
        const result = await usersCollection.find(query).toArray();
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