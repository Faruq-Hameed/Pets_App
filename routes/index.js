const express = require('express')
const mongoose = require ('mongoose')

const  {Pet, Owner} = require('../models')
const {paginate, paginationError} = require('../controllers')

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

// Display a single owner
router.get('/:id', (req, res) => {
    Owner.findById(req.params.id, { pets: 0 })
        .then(owner => {
            if (!owner) {
                res.status(404).send({ message: 'Owner not found' })
                return
            }
            res.status(200).json(owner)
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

// Create an owner when a form is submitted
router.post('/', (req, res) => {
    // check if the new owner's name already exists
    Owner.findOne({ name: req.body.username }, {name: 1, _id: 0})
        .then(owner => {
            if (owner) {
                res.status(409).json({ message: `Owner's name ${req.body.username} already exists` })
                return;
            }
            //create a new owner if the name doesn't exist
            Owner.create({ name: req.body.username })
                .then(newOwner => {
                    res.status(200).json({ message: 'owner created successfully', newOwner: newOwner })
                });
        })
        .catch(err => {
            res.status(500).json({ message: err.message })
        })
})

//this middleware check if the owner Id exists and pass call the next middleware if true
router.use('/:ownerId/', (req, res, next) => {
    Owner.findById(req.params.ownerId, '_id')
    .then((owner) => {
        if (!owner) {
            res.status(404).send({ message: 'Owner not found' })
            return
        }
        return next()
    })
})
// Display all pets for an owner
router.get('/:ownerId/pets', (req, res) => {
    Owner.findById(req.params.ownerId)
        .populate('owner')
        .exec()
        .then(owner => {
            if (!owner) {
                res.status(404).send({ message: 'Owner not found' })
                return
            }
            res.status(200).json(owner)
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

// Display a single pet for an owner
router.get('/:ownerId/pets/:petId', (req, res) => {
    Owner.findById(req.params.ownerId)
        .then(owner => {
           owner.pets.includes(req.params.petId) //check if the pet exists in the owner's pets lists
            if(!doesPetExist){
                res.status(404).json({message: `the pet does not exist in the owner's pets lists`})
                return
            }
        })
        .then(owner => {
            Pet.findById(req.params.petId)
            .then(pet => {
                res.status(200).send(pet)
            })
                
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

module.exports = router


