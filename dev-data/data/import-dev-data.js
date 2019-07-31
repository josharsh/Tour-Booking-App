// Simple script to import the data from json file to our database

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const fs = require('fs');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// to deal with deprecation warnings
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB Connection successful !'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully imported to DB');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// DELETE DATA FROM COLLECTIONS
const deleteTour = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successsfully deleted from DB');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteTour();
}
console.log(process.argv);

// Commands
/**
 * 1. node dev-data/data/import-dev-data.js
 */
