/*** FAT MODELS, THIN CONTROLLERS*** */

const mongoose = require('mongoose');
const slugify = require('slugify');
/**** MONGOOSE SCHEMA FOR TOUR********* */
// For Strings, we have minlength, while for numbers only min
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name must have less or equal to 40 characters'],
      minlength: [10, 'Tour name must have more than or equal to 10 characters']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be either - easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating cannot be above 5'],
      min: [1, 'Rating cannot be below 1']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      //custom validator
      //priceDiscount should be less than price
      //"this" points to the current document, whenever a new document is created
      // validator function does not run on update
      // MONGOOSE CAVEATE
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: ['true', 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: ['true', 'A tour must have an image cover']
    },
    //images must be an array of Strings, so [Strings]
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    // SO that virtuals be a part of our output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**VIRTUAL PROPERTY******** */
//created each time get() is called on the database
// We did not use arrow function here, because arrow functions do not have this keyword
//This is not going to be persisted in the database,
//but it's only gonna be there as soon as we get the data

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

/** DOCUMENTATION MIDDLEWARE************ */
// "this " here refers to the cureent document
// runs before .save and .create
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/***QUERY MIDDLEWARE******** */
// Query middleware allows us to run functions before or after a certain query is "executed"
// "this" here is a query object, so we can chain all of methods that we have for our queries
//ne = not equal to
// RUNS BEFORE ALL THE QUERIES THAT START WITH FIND (SUCH AS FIND, FINONE, FINDANDDELETE) ARE EXECUTED
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// Runs after the query has been executed
//docs refer to the documents that were returned from the query
tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds !`);
  console.log(docs);
  next();
});

/** AGGREGATION MIDDLEWARE */
// "this" refers to the current aggregation object
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

/****** MONGOOSE MODEL FOR TOUR****** */
// It is a convention to start model name with capital letter

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
// DOcument

// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497
// });

// testTour
//   .save()
//   .then(doc => console.log(doc))
//   .catch(err => console.log(err));
