const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeature = require('./utils/APIFeatures');

/*********************ROUTE CONTROLLERS/HANDLERS********************* */
/*****************ALIAS FOR TOP 5 BEST AND CHEAPEST ***********/
// Middleware
exports.aliasRoute = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  next();
};
/*********GET ALL TOURS ***************/

exports.getAllTours = async (req, res) => {
  try {
    // 2- EXECUTE THE QUERY
    const filter = new APIFeature(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await filter.query;

    //3 - SEND THE RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours: tours
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

/****************** GET ONE TOUR *************/

exports.getTour = async (req, res) => {
  //Trick to convert a string into a number
  //params is used to access the variable params of the url
  try {
    //similar to Tour.find({_id:1})
    const id = req.params.id;
    const tour = await Tour.findById(id);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        tours: tour
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

/** *********CREATING A TOUR**************** */

exports.createTour = async (req, res) => {
  try {
    // Creating the document through model directly
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

/*********UPDATING TOUR********** */

exports.updateTour = async (req, res) => {
  try {
    //new:true returns the new/updated document to the tour variable
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: tour });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Invalid dataSet' });
  }
};

/****** ******************* DELETING A TOUR************************* */
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Invalid dataSet' });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   //$match: { _id: { $ne: 'EASY' } }
      // }
    ]);
    res.status(200).json({ status: 'success', data: stats });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Invalid dataSet' });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    // We want to have one tour for each of the dates in the array
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          // id is basically to specify on which field do we want to group By
          _id: { $month: '$startDates' },
          //simply adding 1 for each document
          numTourStarts: { $sum: 1 },
          // making array of tours of each month
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: { _id: 0 }
      },
      {
        //descending order
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);
    res.status(200).json({ status: 'success', data: plan });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: 'Invalid dataSet' });
  }
};
