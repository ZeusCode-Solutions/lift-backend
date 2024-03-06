'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const getLifts = require('./getLifts');
const liftModel = require('./lifts');
const seed = require('./seed');
const verifyUser = require('./authorize');
const app = express();

app.use(cors());
app.use(express.json());
// app.use(verifyUser);

const PORT = process.env.PORT;

mongoose.connect(`mongodb+srv://dstrow13:${process.env.MONGODBPASS}@cluster0.tbqw04p.mongodb.net/?retryWrites=true&w=majority`);


const db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', () => {
    console.log('Mongoose is connected');
    seed();
});

app.get('/', (req, res) => res.status(200).send('Default Route Working'));

app.get('/lifts', getLifts);

app.delete('/lifts/:id', async (req, res) => {
    try {
        const liftId = req.params.id;
        const userEmail = req.user.email;

        if (!mongoose.Types.ObjectId.isValid(liftId)) {
            return res.status(400).json({ error: 'Invalid Lift ID' });
        }

        const deletedLift = await liftModel.findOneAndDelete({ _id: liftId, user: userEmail });

        if (!deletedLift) {
            return res.status(404).json({ error: 'Lift Not Found' });
        }

        res.json({ message: 'Lift Deleted Successfully', deletedLift });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.put('/lifts/:id', async (req, res) => {
    console.log(req.params.id)
    console.log(req.user.email)
    try {
        const liftId = req.params.id;
        const userEmail = req.user.email;

        if (!mongoose.Types.ObjectId.isValid(liftId)) {
            return res.status(400).json({ error: 'Invalid Lift ID' });
        }

        const updatingLift = await liftModel.findOneAndUpdate(
            { _id: liftId, user: userEmail },
            req.body,
            { new: true }
        );

        if (!updatingLift) {
            return res.status(404).json({ error: 'Lift Not Found' });
        }

        res.json({ message: 'Lift Updated Successfully', updatingLift });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.post('/lifts', async (req, res) => {
    try {
        const { title, description, exercises } = req.body;
        const userEmail = req.user.email;
        console.log('I am in the post route', userEmail)

        if (!title || !description || !exercises || !exercises.length) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newLift = await liftModel.create({
            user: userEmail,
            title,
            description,
            exercises: exercises.map(exercise => ({
                movement: exercise.movement,
                weight: exercise.weight,
                sets: exercise.sets,
                reps: exercise.reps,
            })),
        });

        console.log('New Lift Created:', newLift);
        res.status(201).json(newLift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.put('/lifts/:id/exercises/:exerciseId', async (req, res) => {
    try {
        const { id: liftId, exerciseId } = req.params;
        const userEmail = req.user.email;
        const { movement, weight, sets, reps } = req.body;

        const existingLift = await liftModel.findOne({ _id: liftId, user: userEmail });

        if (!existingLift) {
            return res.status(400).json({ error: 'Lift Not Found' });
        }

        const exerciseIndex = existingLift.exercises.findIndex(exercise => exercise._id === exerciseId);

        if (exerciseIndex === -1) {
            return res.status(404).json({ error: 'Exercise Not Found' });
        }

        const updatedExercise = {
            movement,
            weight,
            sets,
            reps,
        };

        existingLift.exercises.push(updatedExercise);

        const updatedLift = await existingLift.save();
        console.log('Updated Lift:', updatedLift);
        res.status(201).json(updatedLift);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.get('*', (req, res) => res.status(404).send('Resource Not Found'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));