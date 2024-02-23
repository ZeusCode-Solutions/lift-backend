'use strict'

const Lift = require('./lifts');

async function getLifts(req, res, next){
    const userEmail = req.user.email;
    console.log('Here is the user: ', userEmail)
    const lifts= await Lift.find({user: userEmail})
    res.status(200).send(lifts)
    // .then(data => res.status(200).send(data))
    // .catch(e => next(e));
}
module.exports = getLifts;