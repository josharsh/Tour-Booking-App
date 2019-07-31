const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeature = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErrors');
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

exports.getAllTours = catchAsync(async (req, res) => {
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
});

/****************** GET ONE TOUR *************/

exports.getTour = catchAsync(async (req, res) => {
  //Trick to convert a string into a number
  //params is used to access the variable params of the url

  //similar to Tour.find({_id:1})
  const id = req.params.id;
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      tours: tour
    }
  });
});

/** *********CREATING A TOUR**************** */

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour }
  });
});

/*********UPDATING TOUR********** */

exports.updateTour = catchAsync(async (req, res, next) => {
  //new:true returns the new/updated document to the tour variable
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: tour });
});

/****** ******************* DELETING A TOUR************************* */
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});

exports.getTourStats = catchAsync(async (req, res) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
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
});
