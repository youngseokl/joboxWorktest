//server.js
const express = require('express'),
      app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 8080);

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/jobox");
require('mongoose-type-url');

// Schema for QA
var qaSchema = new mongoose.Schema({
    host_name: String,
    start_time: String,
    end_time: String
});
var Qa = mongoose.model("Qa", qaSchema);

// Schema for Question
var questionSchema = new mongoose.Schema({
  text: String,
  asked_by: String,
  qa_id: [
      {type: mongoose.Schema.Types.ObjectId, ref: 'Qa'}
    ],
  answered: [
    {type: Boolean, default: false}
  ]
});
var Question = mongoose.model("Question", questionSchema);

// Schema for Answer
var answerSchema = new mongoose.Schema({
  text: String,
  answered_by: String,
  image_url: mongoose.SchemaTypes.Url,
  question_id: [
      {type: mongoose.Schema.Types.ObjectId, ref: 'Question'}
    ]
});
var Answer = mongoose.model("Answer", answerSchema);

const qaRouter = require('./routes/qa');

// Create Q&A Session
app.post('/qa',(req,res)=>{
  var qaData = new Qa(req.body);
    qaData.save()
        .then(item => {
            res.send("New QA session created with qa_id " + qaData._id);
        })
        .catch(err => {
            res.status(400).send("Unable to create a new QA session");
        });
});

// Get Q&A Session
app.get('/qa', (req, res)=>{
  Qa.findById(req.query.id, function(err, qa) {
        if (err) return console.error(err);
        res.send(qa);

    });
});

// Ask a question
app.post('/question', (req, res)=>{
  var questionData = new Question(req.body);
  questionData.save()
    .then(item => {
        res.send("Question (id"+ questionData._id +") successfully posted!");
    })
    .catch(err => {
        res.status(400).send("Unable to post question");
    });
});

// Answer a question
app.post('/answer', (req, res)=>{
  var answerData = new Answer(req.body);

  Question.update({_id: req.body.question_id}, {
    answered: true
  }, function(err) {
    console.error(err);
  })
  answerData.save()
    .then(item => {
        res.send("Thank you " + req.body.answered_by + ", your answer is successfully posted!");
    })
    .catch(err => {
        res.status(400).send("Unable to post Answer");
    });
})

// Get questions
app.get('/qa/questions', (req, res)=>{
  console.log(req.query.answered);
  console.log(req.query.qa_id);
  console.log('/qa/questions');
  Question.find({_id: req.query.qa_id, answered: req.query.answered}, function(err, question) {
        if (err) return console.error(err);
        res.send(question);
    });
});

// Basic root page
app.get('/',(request,response)=>{
   response.send('Q&A session');
});

// Error handling
app.use((request,response)=>{
   response.type('text/plain');
   response.status(505);
   response.send('Error page!!');
});

//Binding to a port
app.listen(8080, ()=>{
  console.log('Server started at port 8080');
});
