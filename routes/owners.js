const express = require('express')
const mongoose = require ('mongoose')

const  {Pet, Owner} = require('../models')
const {paginate, paginationError, petSchema, ownerSchema} = require('../utils')

const router = express.Router({ mergeParams: true })

// GET owners List all owners
router.get('/', (req, res) => {
    Owner.find({}, {pets: 0})
    .then(owners =>{
        const paginationErr = paginationError(owners, req)
        if (paginationErr){
            res.status(paginationErr.status).json({message : paginationErr.message})
            return
        }
        const paginatedLists = paginate(owners, req, 'owners')
        res.status(200).json(paginatedLists)
    })
    .catch(err => {
        res.status(500).send({message: err.message})
    })
})

// Display a form for creating a new owner
router.get('/new', (req, res) => {
    res.status(200).render('register')
})

// Create an owner when a form is submitted
router.post('/', (req, res) => {
    const validation = ownerSchema(req.body)
    if (validation.error) {
        res.status(422).send(validation.error.details[0].message);
        return;
    }
    // check if the new owner's name already exists
    Owner.findOne({ name: validation.value.ownername }, {name: 1, _id: 0})
        .then(owner => {
            if (owner) {
                res.status(409).json({ message: `Owner's name ${validation.value.ownername} already exists` })
                return;
            } 
            //create a new owner if the name doesn't exist
            Owner.create({ name: validation.value.ownername })
                .then(newOwner => {
                    res.status(200).json({ message: 'owner created successfully', newOwner: newOwner })
                });
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
        })
})

/*this middleware check if the owner Id exists 
pass call the next middleware if true and add the owner object to the req.body
as ownerObject
*/
router.use('/:ownerId/', (req, res, next) => {
    Owner.findById(req.params.ownerId, {pets: 0})
    .then((owner) => {
        if (!owner) {
            res.status(404).send({ message: 'Owner not found' })
            return
        }
        req.body.ownerObject = owner
        return next()
    })
    .catch(err => {
        res.status(500).send({ message: err.message })
    })
})
// Display a single owner
router.get('/:id', (req, res) => {
    res.status(200).send(req.body.ownerObject)
})

// Edit an owner when a form is submitted
router.patch('/:ownerId', (req, res) => {
    const validation = ownerSchema(req.body)
    if (validation.error) {
        res.status(422).send(validation.error.details[0].message);
        return;
    }
    //check if an owner with the new name exists
    Owner.findOne({ name: req.body.name }, { pets: 0 })
        .then((owner_2) => {
            if (!owner_2) {
                Owner.findByIdAndUpdate(req.params.ownerId, { name: req.body.name })
                    .then(() => {
                        res.status(200).json({ message: 'update successfully done' })
                    })
                return;
            }
           
            const owner = req.body.ownerObject  // ownerObject added by the middleware
            if (owner._id.toString() !== owner_2._id.toString()) {
                res.status(409).json({ message: `Owner's name ${req.body.name} already exists for another owner` })
                return;
            }
            // update if the new name is not conflicting with another owner's name
                    owner.name = req.body.name
                    owner.save()
                    res.status(200).json({ message: 'update successfully done' })
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

// Delete an owner when a form is submitted
router.delete('/:id', (req, res) => {
    Owner.findByIdAndDelete(req.params.id)
        .then(owner => { //needed to delete all pets for the owner too
            res.status(200).json({message: 'owner account deleted successfully'})
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

module.exports = router


