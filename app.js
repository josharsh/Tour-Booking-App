//it is a convention to keep all our express configuration in app.js

const fs = require('fs');

const express = require('express');
const app = express();

//this express.json() is the middleware
///middleware is just a function that can modify the incoming request data
// called middleware because it stands between the req and res
app.use(express.json());
//listen to start up the server
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//defining the routes
//Routing means how an application responds to a certain client request, or to a certain URl, or a certain http method
// use send to send a string
// and json to send json
//Using json methods, automatically specifies our 'Content-type' to 'application/json'

// Sending different reponses for different https methods (get,post)
// app.get('/', (req, res) => {
//   res.status(200).json({
//     message: 'Hello from the server side !',
//     app: 'Natours'
//   });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint !');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// It is a good practice to specify the version of api
//Whenever sending an array from an API, it is a good practice to specify the length under results.
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours
    }
  });
});

//req holds the data to be send from client to server
// the body here comes from the middleware
// Note : we always need to send something in order to complete the request-response cycle
//Note : You can send only one response

app.post('/api/v1/tours', (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;

  //Object.assign let's us create a new object by merging two objects together
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
});
