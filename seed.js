'use strict'

const mongoose = require('mongoose');
require('dotenv').config();
const Lift = require('./lifts');

mongoose.connect(`mongodb+srv://dstrow13:${process.env.MONGODBPASS}@cluster0.tbqw04p.mongodb.net/?retryWrites=true&w=majority`);


async function seed() {
    try{
        await Lift.create({
            title: "Day 1",
            description: "Push Day",
        })
        .then(()=> console.log('Saved Day 1'))
        await Lift.create({
            title: "Day 2",
            description: "Pull Day",
        })
        .then(() => console.log('Saved Day 2'));
        await Lift.create({
            title: "Day 3",
            description: "Leg Day",
        })
        .then(() => console.log('Saved Day 3'));
    } catch (e){
        console.log(e.message)
    }
}

module.exports = seed;