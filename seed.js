'use strict'

const mongoose = require('mongoose');
require('dotenv').config();
const Lift = require('./lifts');

mongoose.connect(`mongodb+srv://dstrow13:${process.env.MONGODBPASS}@cluster0.tbqw04p.mongodb.net/?retryWrites=true&w=majority`);

async function seed() {
  try {
    await Lift.create({
        user: "dstrow13@gmail.com",
        title: "Day 1",
        description: "Push Day",
        exercises: [
          { movement: 'Bench Press', weight: 135, sets: 3, reps: 8 },
          { movement: 'Overhead Press', weight: 95, sets: 3, reps: 10 },
          
        ],
      }).then(() => console.log('Saved Day 1'));
    await Lift.create({
        user: "dstrow13@gmail.com",
        title: "Day 2",
        description: "Pull Day",
        exercises: [
          { movement: 'Deadlift', weight: 225, sets: 3, reps: 5 },
          { movement: 'Pull-ups', weight: 0, sets: 3, reps: 10 },
          
        ],
      }).then(() => console.log('Saved Day 2'));
  
      await Lift.create({
        user: "dstrow13@gmail.com",
        title: "Day 3",
        description: "Leg Day",
        exercises: [
          { movement: 'Squats', weight: 185, sets: 4, reps: 8 },
          { movement: 'Lunges', weight: 25, sets: 3, reps: 12 },
          
        ],  
       })   .then(() => console.log('Saved Day 3'));
    } catch (e){
        console.log(e.message)
    }
}

module.exports = seed;