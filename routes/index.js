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

// Display a single owner
router.get('/id', (req, res) => {
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

//  /owners/
// Display all pets for an owner
router.get('/:ownerId/pets', (req, res) => {
    Owner.findById(req.params.id)
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

module.exports = router


