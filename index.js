const PORT = process.env.PORT || 8000
const axios = require("axios").default
const express = require("express")
const cors = require("cors")
var bodyParser = require('body-parser')
var randomWords = require('random-words');




require('dotenv').config()
const app = express()
app.use(bodyParser.json());
app.use(cors())
app.set('trust proxy', true)

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res) {
    res.sendFile(__dirname + '/index.html');
  });




let score = 0, level = 0, currlevScore = 1;
app.post("/postScore", (req, res) => {
    let gotScore = req.body.score;
    let gotLevel = req.body.level;
    let gotcurrlevScore = req.body.currlevScore;
    score = gotScore;
    level = gotLevel;
    currlevScore = gotcurrlevScore;
})


app.get("/getScore", (req, res) => {
    res.json(score+";"+level+";"+currlevScore);
});

app.get('/word', (req, res) => {
    s = ''
    while(s.length != 5)
    {
        s = randomWords()
    }
    console.log(s)
    res.json(s)
})

app.get('/check', (req, res) => {
    const word = req.query.word;

    const options = {
        method: 'GET',
        url : "https://api.wordnik.com/v4/word.json/" + word + "/definitions?limit=200&includeRelated=false&useCanonical=false&includeTags=false&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5"
    }
    axios.request(options).then((response) => {
        // console.log(response.data)
        res.json(response.data)
    }).catch((error) => {
        res.json({"data":"Entry word not found"});
        console.error(error.data)
    })
})


app.listen(PORT, () => console.log('Server running on port ' + PORT))
