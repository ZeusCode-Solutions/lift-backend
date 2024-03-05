'use strict'

const mongoose = require('mongoose');

const {Schema} = mongoose;

const exerciseSchema = new Schema({
    movement: String,
    weight: Number,
    sets: Number,
    reps: Number,

});

const liftSchema = new Schema({
    user: String,
    title: String,
    description: String,
    exercises: [exerciseSchema],

})


let liftModel = mongoose.model('Lift', liftSchema);

module.exports = liftModel;