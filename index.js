const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.stripe_key);
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
const paymentsCollection = client.db('resale').collection('payments');
const advCollection = client.db('resale').collection('adv');
const wishlistCollection = client.db('resale').collection('wishlist');



app.post('/create-payment-intent', async (req, res) => {
    const order = req.body;
    const price = order.bookPrice;
    const amount = price * 100;
    // console.log(amount);
    const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: amount,
        "payment_method_types": [
            "card"
        ]
    });
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

app.post('/payments', async (req, res) => {
    const payment = req.body;

    //delete from advertise
    const orderId = payment.orderId;
    const findOrderquery = { _id: new ObjectId(orderId) };
    const findOrderData = await ordersCollection.findOne(findOrderquery);
    const productId = findOrderData.product_id;
    const advQuery = { _id: new ObjectId(productId) };
    const deletedresult = await advCollection.deleteOne(advQuery);

    //insert in payment collection
    const result = await paymentsCollection.insertOne(payment);
    const id = payment.orderId;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }
    const updatedResult = await ordersCollection.updateOne(filter, updatedDoc)
    res.send(result);
})


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

app.get('/iswhat/:email', async (req, res) => {
    try {
        const mail = req.params.email;
        const query = { email: mail };
        const result = await usersCollection.findOne(query);
        // console.log(result);
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
app.get('/isseller/:email', async (req, res) => {
    try {
        const mail = req.params.email;
        const query = { email: mail };
        const result = await usersCollection.findOne(query);
        // console.log(result);
        if (result.role === 'seller') {
            return res.send({ isSeller: true });
        }
        return res.send({ isSeller: false });
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})
app.get('/isadmin/:email', async (req, res) => {
    try {
        const mail = req.params.email;
        const query = { email: mail };
        const result = await usersCollection.findOne(query);
        // console.log(result);
        if (result.role === 'admin') {
            return res.send({ isAdmin: true });
        }
        return res.send({ isAdmin: false });
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
        const query = {
            category_id: id,
            sold: false
        };
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

app.put("/sellerverify", async (req, res) => {
    try {
        const mail = req.query.mail;
        const filter = { email: mail };
        // console.log(filter);
        // const data = await usersCollection.findOne(query);
        const options = { updsert: true }
        const updateDoc = {
            $set: {
                appVerified: true
            },
        };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
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
app.get('/order/:id', async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const query = { _id: new ObjectId(id) };
    const order = await ordersCollection.findOne(query);
    res.send(order);
})

app.get("/issold/:id", async (req, res) => {
    const id = req.params.id;
    const query = { orderId: id };
    // console.log(query);
    const result = await paymentsCollection.findOne(query);
    // console.log(result);
    if (result) {
        return res.send(true);
    }
    else {
        return res.send(false);
    }
})

app.delete("/deletebook/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        console.log(query);
        const adfind = { product_id: id }
        const addresult = await advCollection.deleteOne(adfind);
        const dresult = await booksCollection.deleteOne(query);
        console.log(addresult, dresult);
        res.send(dresult);
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})
app.get('/wishlist', async (req, res) => {
    try {
        // console.log("inside of wishlist");
        const query = {};
        const result = await wishlistCollection.find(query).toArray();
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
app.post('/wishlist/:id', async (req, res) => {
    try {
        const tempdata = {
            product_id: req.params.id
        }
        const findquery = await wishlistCollection.findOne(tempdata);
        if (!findquery) {
            const query = { _id: new ObjectId(req.params.id) }
            const data = await booksCollection.findOne(query);
            const result = await wishlistCollection.insertOne(data);
            return res.send(result);
            console.log(result);
        }
        return res.send({
            acknowledged: false
        })
    }
    catch (e) {
        console.log(e);
        res.send({
            "status": false,
            "error": e
        })
    }
})

app.get('/adv', async (req, res) => {
    try {
        const query = {};
        const result = await advCollection.find(query).toArray();
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

app.post('/adv/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                adv: true,
                product_id: id
            }
        }
        const options = { upsert: true };
        const updateData = await booksCollection.updateOne(query, updateDoc, options);
        const findData = await booksCollection.findOne(query);
        // console.log(findData);
        const result = await advCollection.insertOne(findData);
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
app.post('/offadv/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                adv: false
            }
        }
        const updateData = await booksCollection.updateOne(query, updateDoc);
        const delquery = { product_id: id };
        const result = await advCollection.deleteOne(delquery);
        // console.log(result);
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

// app.get('/sold', async (req, res) => {
//     const query = {};
//     const options = { upsert: true };
//     const updateDoc = {
//         $set: {
//             sold: false
//         },
//     };
//     const result = await booksCollection.updateMany(query, updateDoc, options);
//     console.log(result);
//     res.send(result);
// })


app.listen(port, () => {
    console.log(`resale server is running on port: ${port}`);
})