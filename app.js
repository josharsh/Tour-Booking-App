//it is a convention to keep all our express configuration in app.js
// It is a good practice to specify the version of api
//Whenever sending an array from an API, it is a good practice to specify the length under results.

//req holds the data to be send from client to server
// the body here comes from the middleware
// Note : we always need to send something in order to complete the request-response cycle
//Note : You can send only one response
/**
 *  STATUS CODES
 * 1. 200 - OK
 * 2. 404 - NOT FOUND
 * 3. 201 - SUCCESSFULLY CREATED
 * 4. 500 - internal server error
 *
 */
//Object.assign let's us create a new object by merging two objects together

const morgan = require('morgan');

const express = require('express');

const app = express();

const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
//this express.json() is the middleware
///middleware is just a function that can modify the incoming request data
// called middleware because it stands between the req and res

/************ MIDDLEWARES **********/
// INE EXPRESS, WE SHOULD ALWAYS USE AS MUCH AS MIDDLEWARES WE CAN

// For res.body
// BODY PARSER
app.use(express.json());

// For serving static files from a folder, and not from a route
//Now to see any static file from public folder, access 127.0.0.1:3000/overview.html, and not 127.0.0.1:3000/public/overview.html

app.use(express.static(`${__dirname}/public`));

// For getting the current date
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Morgan - lets us see the request data right in the console
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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

/****************************HANDLER FUNCTIONS***************************** */

/**************************** FOR USERS******************* */

/*********************** ROUTES ***********/

// app.route('/api/v1/users').get(function_name).post(function_name);
// Now we will create a route for each of our resource
// tourRouter and userRouter is a sort of middleware or a sub application
// This is knows as Mounting of Routers

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
