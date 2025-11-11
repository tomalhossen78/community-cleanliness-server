const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = 3000


// middleware
app.use(cors());
app.use(express.json())

// mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vybtxro.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅Pinged your deployment. You successfully connected to MongoDB!");

    const cleanlinessDB = client.db('cleanlinessDB');
    const issuesCollections = cleanlinessDB.collection('issuesCollections');
    const myContributionsCollections = cleanlinessDB.collection('myContributionsCollections')
    const usersCollection = cleanlinessDB.collection('usersCollection')


    app.post('/issues',async(req,res)=>{
        const data = req.body;
        const result = await issuesCollections.insertOne(data);
        res.send(result);
    })

    app.post('/my-contributions',async(req,res)=>{
      const data = req.body;
      const result = await myContributionsCollections.insertOne(data);
      res.send(result);
    })
    app.get('/my-contributions',async(req,res)=>{
      const email = req.query.email;
      const result = await myContributionsCollections.find({email : email}).toArray()
      res.send(result);
    })
    app.get('/my-issues',async(req,res)=>{
      const email = req.query.email;
      const result = await issuesCollections.find({email : email}).toArray()
      res.send(result);
    })
    app.get('/issues',async(req,res)=>{
        const result = await issuesCollections.find().sort({date : -1}).toArray();
        res.send(result);
    })
    app.get('/issues/:id',async(req,res)=>{
      const id = req.params.id;
        const result = await issuesCollections.findOne({_id : new ObjectId(id)});
        res.send(result);
    })

    app.get('/recent-complaints',async(req,res)=>{
      const result = await issuesCollections.find().sort({date : -1}).limit(4).toArray();
      res.send(result);
    })

    app.get(`/issues`,async(req,res)=>{
         const email = req.query.email;
    const result = await issuesCollections.find({email_by : email}).toArray()
        res.send(result);
    })

    app.patch('/issues/:id',async(req,res)=>{
        const id = req.params.id;
        const updateIssues = req.body;
        const query = {_id : new ObjectId(id)};
        const update = {
            $set:{
                title : updateIssues.title,
                amount : updateIssues.amount,
                cat : updateIssues.cat,
                image : updateIssues.image,
                location : updateIssues.location,
                status : updateIssues.status,
                email : updateIssues.email,
                description : updateIssues.description,
            }
        }
        const result = await issuesCollections.updateOne(query,update);
        res.send(result);
    })
    app.delete('/issues/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await issuesCollections.deleteOne(query);
        res.send(result);
    })

    app.post('/users',async(req,res)=>{
      const user = req.body;
      const existingUser = await usersCollection.findOne({email : user.email})
      if(existingUser){
        return;
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    app.get('/users',async(req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

  app.get("/community-stats", async (req, res) => {
  const totalUsers = await usersCollection.countDocuments();
  const resolvedIssues = await issuesCollections.countDocuments({ status: "solved" });
  const pendingIssues = await issuesCollections.countDocuments({ status: "ongoing" });

  res.send({totalUsers, resolvedIssues, pendingIssues });
});

     } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World , How are all today!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
