//jshint esversion:8
require("dotenv").config();
const express=require('express');
const bodyParser=require('body-parser');
const https=require("https");
const fetch = require('node-fetch');
const ejs=require('ejs');
const { response } = require('express');
const path=require("path");
const app=express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});


const dialogflow = require('@google-cloud/dialogflow').v2beta1;
const uuid = require('uuid');
const { ConversationProfilesClient } = require("@google-cloud/dialogflow/build/src/v2");
const sessionClient = new dialogflow.SessionsClient({
  keyFilename:__dirname+"\\essential.json"
});
/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(message,projectId = 'vaccine-finder-lnbm') {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
 
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  const id1=process.env.id1;
  const id2=process.env.id2;
  const id3=process.env.id3;
  const knowledgeBasePath1 = 'projects/' + projectId + '/knowledgeBases/' + id1 + '';
  const knowledgeBasePath2='projects/' + projectId + '/knowledgeBases/' + id2 + '';
  const knowledgeBasePath3='projects/' + projectId + '/knowledgeBases/' + id3 + '';
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: message,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
      queryParams: {
        knowledgeBaseNames: [knowledgeBasePath1,knowledgeBasePath2,knowledgeBasePath3]
      },
    },

  };
  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
   console.log(`  Query: ${result.queryText}`);
  
   console.log(`  Response: ${result.fulfillmentText}`);
   if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    // console.log(result);
  } else {
    console.log('  No intent matched.');
  }
  
 return result.fulfillmentText;
}
//end


var cities=[];
var selectedState='Select a state';
var formType;
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.set('view engine','ejs');
app.get("/pinCode",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
});
app.get("/",(req,res)=>{
    res.render("main");
});
app.post("/slotBypinId",(req,res)=>{
    formType=req.body.buttonType;
    res.redirect("/index");
});
// app.get("/index",(req,res)=>{
//   res.render("index",{states:obj.states,cities:cities,selectedState:selectedState,formType:formType});
// })
app.use(express.static(path.join(__dirname, "/views/build")));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/views/build', 'index.ejs'));
// });
app.get("/index",(req,res)=>{
    let date=new Date(req.body.date);
    let dateformat=date.toLocaleString("en-GB");
      const stateUrl="https://cdn-api.co-vin.in/api/v2/admin/location/states";
      https.get(stateUrl,(response)=>{
              response.on("data",(data)=>{
                  var obj=JSON.parse(data);
                  console.log(cities);
                  res.render("index",{states:obj.states,cities:cities,selectedState:selectedState,formType:formType});
              });
});
});
app.listen(process.env.PORT || 3000,()=>{
    console.log("app is working");
});
app.post("/selectDistrict",(req,res)=>{
    let state=JSON.parse(req.body.states);
   selectedState=state.state_name;
   let id=state.state_id;
    const url='https://cdn-api.co-vin.in/api/v2/admin/location/districts/'+id;
    fetch(url)
    .then((res)=>res.json())
    .then((data)=> {
        cities=data.districts;
    });
res.redirect("/index");
});

app.post("/",(request,response)=>{
    let date=new Date(request.body.date);
  let dateformat=date.toLocaleString("en-GB");
  let url;
  if(request.body.reqtype!="searchByDistrict")
     url="https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode="+request.body.pinCode+"&date="+dateformat;
    else
        url='https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id='+request.body.city_id+'&date='+dateformat;
        fetch(url)
        .then((res)=>res.json())
        .then((data)=> {
      response.render("centers",{centers:data.centers});
        });
});
app.post("/getChatData",(req,res)=>{
        console.log("method is called");
        runSample(req.body.message).then(data=>{
            res.send({returnVal:data});
        });
});