const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
/************************************** MIDDLEWARES********************************* */

/******* PARAM MIDDLEWARE ***********/
// param middleware only runs for certain parameters, basiaclly when we have a certain parameter in URL
// val = value of the parameter in question

exports.checkId = (req, res, next, val) => {
  const len = tours.length;
  if (req.params.id * 1 > tours.length || req.params.id < 0) {
    return res.status(404).json({ status: 'fail', message: 'invalid ID' });
  }
  next();
};

/******** MIDDLEWARE TO CHECK BODY ************ */
exports.checkBody = (req, res, next) => {
  console.log(`request ki body hai ${req}`);
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ status: 'failed', message: 'Missing name or price' });
  }
  next();
};

/*********************ROUTE CONTROLLERS/HANDLERS********************* */
/*********GET ALL TOURS ***************/

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours
    }
  });
};

/****************** GET ONE TOUR *************/

exports.getTour = (req, res) => {
  console.log(req.params);

  //Trick to convert a string into a number
  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tours: tour
    }
  });
};

/** *********CREATING A TOUR**************** */

exports.createTour = (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
};

/*********UPDATING TOUR********** */

exports.updateTour = (req, res) => {
  res.status(200).json({ data: '<...Updated tour here ...>' });
};

/****** ******************* DELETING A TOUR************************* */
exports.deleteTour = (req, res) => {
  res.status(204).json({ data: null });
};
