'use strict'

require('dotenv').config()
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

const PORT = process.env.PORT

mongoose.connect(`mongodb+srv://dstrow13:${process.env.MONGODBPASS}@cluster0.tbqw04p.mongodb.net/?retryWrites=true&w=majority`);


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error'));
db.once('open', () => {
    console.log('Mongoose is connected');
    
    seed();
});


app.get('/', (req, res, next) => res.status(200).send('Default Route Working'));

app.use(verifyUser);

app.get('/lifts', getLifts);

app.delete('/lifts/:id', async (req, res, next) => {
    try{
        const liftId = req.params.id;
        const userEmail = req.user.email;
        if(!mongoose.Types.ObjectId.isValid(liftId)) {
            return res.status(400).json({error: 'Invalid Lift ID'});
        }

        const deletedLift =await liftModel.findOneAndDelete({_id: liftId, user: userEmail });

        if (!deletedLift) {
            return res.status(404).json({ error: 'Lift Not Found'});
        }

        res.json({message: 'Lift Deleted Successfully' , deletedLift});
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message});
        }
    });

app.put('/lifts/:id', async (req, res, next) => {
    try {
        const liftId = req.params.id;
        const userEmail = req.user.email;

        console.log('Received request to update lift:', liftId);
        console.log('User Email:', userEmail);
        console.log('Request Body:', req.body);

        if (!mongoose.Types.ObjectId.isValid(liftId)) {
            return res.status(400).json({ error: 'Invalid Lift ID' });
        }

        const existingLift = await liftModel.findOne({ _id: liftId, user: userEmail });
        console.log('Trying to find lift with ID:', liftId);
        console.log('Existing Lift:', existingLift);

        if (!existingLift) {
            console.log('Lift Not Found');
            return res.status(404).json({ error: 'Lift Not Found' });
        }

        if (req.body.exercises && Array.isArray(req.body.exercises)) {
            existingLift.exercises = req.body.exercises.map(exercise => ({
                exercise: exercise.movement,
                weight: exercise.weight,
                sets: exercise.sets,
                reps: exercise.reps,
            }));
        }


        existingLift.title = req.body.title;
        existingLift.description = req.body.description;

        const updatingLift = await existingLift.save();
        console.log('Updated Lift:', updatingLift);

        res.json({ message: 'Lift Updated Successfully', updatingLift });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.post('/lifts', async (req, res, next) => {
    try {
        console.log('This is post log:', req.body);
        const { title, description } = req.body;
        const userEmail = req.user.email;
        console.log('I am in the post route', userEmail)

        if (!title || !description ) {
            return res.status(400).json({ error: 'All fields are required'})
        }
        
        const newLift = await liftModel.create({
            title: req.body.title,
            description: req.body.description,
            exercises: req.body.exercises.map(exercise => {
              const mappedExercise = {
                exercise: exercise.movement, 
                weight: exercise.weight,
                sets: exercise.sets,
                reps: exercise.reps,
              };
              console.log('Mapped Exercise:', mappedExercise); // Add this line
              return mappedExercise;
            }),
            user: userEmail,
          });
  
        console.log('New Lift Created:', newLift);
        res.status(201).json(newLift);
    } catch (error){
        console.error(error);
        res.status(500).json({error: 'Internal; Server Error', details: error.message})
    }
});

app.put('/lifts/:id/exercises/:exerciseId', async (req, res, next) => {
    try {
      const liftId = req.params.id;
      const exerciseId = req.params.exerciseId;
      const userEmail = req.user.email;
      const { movement, weight, sets, reps } = req.body;
  
      console.log('this is put log', liftId, exerciseId);
      console.log('Updated exercise data:', req.body);
  
      const existingLift = await liftModel.findById(liftId);
      console.log(liftId)
  
      if (!existingLift) {
        return res.status(400).json({ error: 'Lift Not Found' });
      }
  
      const exerciseIndex = existingLift.exercises.findIndex(exercise => exercise._id == exerciseId);
  
      if (exerciseIndex === -1) {
        return res.status(404).json({ error: 'Exercise Not Found' });
      }
  
      existingLift.exercises[exerciseIndex].movement = movement;
      existingLift.exercises[exerciseIndex].weight = weight;
      existingLift.exercises[exerciseIndex].sets = sets;
      existingLift.exercises[exerciseIndex].reps = reps;
  
      const updatedLift = await existingLift.save();
      console.log('Updated Lift:', updatedLift);
      res.status(201).json(updatedLift);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  
app.get('*', (req, res, next) => res.status(404).send('Resource Not Found'));

app.listen(PORT, () => console.log(`listening on ${PORT}`));