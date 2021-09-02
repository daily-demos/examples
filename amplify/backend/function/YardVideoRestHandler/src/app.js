/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require('express')
const https = require('https')
// const cors = require('cors')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())
// app.use(cors({
//     origin: ['https://video.yard.live/', 'http://localhost:3000/']
// }));

// Enable CORS for all methods
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "h")
//   res.header("Access-Control-Allow-Headers", "*")
//   res.header("Access-Control-Allow-Methods", "OPTIONS,POST,GET")
//   next()
// });


/**********************
 * Example get method *
 **********************/

app.get('/video/api', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

app.get('/video/api/token', function(req, res) {
  const options = {
    hostname: 'catfact.ninja',
    port: 443,
    path: '/fact',
    method: 'GET'
  }
  
  https.request(options, response => {
    console.log(`statusCode: ${response.statusCode}`)
  
    response.on('data', d => {
      res.send(d)
    })
  }).on('error', error => {
    console.error(error)
  }).end();
});

app.post('/video/api/token', function(req, res) {
  var { roomName, isOwner } = req.body;
  
  const rBody = new TextEncoder().encode(
    JSON.stringify({
      properties: {
        room_name: roomName,
        is_owner: isOwner
      }
    })
  )
  
  const options = {
    hostname: 'api.daily.co',
    port: 443,
    path: '/v1/meeting-tokens',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': rBody.length,
      'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
    }
  }
  
  const r = https.request(options, response => {
    console.log(`statusCode: ${response.statusCode}`)
  
    response.on('data', d => {
      res.send(d)
    })
  }).on('error', error => {
    console.error(error)
  });
  
  r.write(rBody)
  r.end();
  
});
/****************************
* Example post method *
****************************/

// app.post('/video/api', function(req, res) {
//   // Add your code here
//   res.json({success: 'post call succeed!', url: req.url, body: req.body})
// });

// app.post('/video/api/*', function(req, res) {
//   // Add your code here
//   res.json({success: 'post call succeed!', url: req.url, body: req.body})
// });

// /****************************
// * Example put method *
// ****************************/

// app.put('/video/api', function(req, res) {
//   // Add your code here
//   res.json({success: 'put call succeed!', url: req.url, body: req.body})
// });

// app.put('/video/api/*', function(req, res) {
//   // Add your code here
//   res.json({success: 'put call succeed!', url: req.url, body: req.body})
// });

// /****************************
// * Example delete method *
// ****************************/

// app.delete('/video/api', function(req, res) {
//   // Add your code here
//   res.json({success: 'delete call succeed!', url: req.url});
// });

// app.delete('/video/api/*', function(req, res) {
//   // Add your code here
//   res.json({success: 'delete call succeed!', url: req.url});
// });

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
