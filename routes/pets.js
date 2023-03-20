const express = require('express')
const mongoose = require ('mongoose')

const  {Pet, Owner} = require('../models')
const {paginate, paginationError} = require('../utils')

const router = express.Router()
// Display a form for creating a new owner
router.get('/:ownerId/pets/new', (req, res) => {
    res.status(200).render('newpet')
})

router.post("/pug/pen:ownerId/pets", (req, res, next) => {
    // create a new Pet based on request body
    const newPet = new Pet({name: req.body.petname, owner: ownerId});
    // extract ownerId from route
    const { ownerId } = req.params;
    // save the newPet
    return newPet
      .save()
      .then(pet => {
        // update the owner's pets array
        return Owner.findByIdAndUpdate(
          ownerId, // query owner by route param
          /*
           Add new pet's ObjectId (_id) to set of Owner.pets.
           We use $addToSet instead of $push so we can ignore duplicates!
          */
          { $addToSet: { pets: pet._id } }
        );
      })
      .then(() => {
        return res.redirect(`/owners/${ownerId}/pets`);
      })
      .catch(err => next(err)); // pass DB errors along to error handler
  });
  

// Create an owner when a form is submitted
router.post('/:ownerId/pets', (req, res, next) => {
    // create a new Pet based on request body and request
    const ownerId = req.params.ownerId
    const newPet = {name: req.body.petname, owner: ownerId}
    Pet.create(newPet)
    .then((pet) => {
        Owner.findByIdAndUpdate(ownerId, { $addToSet: { pets: pet._id } })
        .then((owner) =>{
            console.log({owner})
        })
    })
   .then(() => {
    //  return res.redirect(`/owners/${ownerId}/pets`);
   })
   .catch(err => next(err)); // pass DB errors along to error handler
})


// Display all pets for an owner
router.get('/:ownerId/pets', (req, res) => {
    Owner.findById(req.params.ownerId)
        .populate('pets')
        .exec()
        .then(owner => {
            console.log({owner})
            if(owner.pets.length == 0){
                res.status(204).send() //if the owner doesn't have any pets
                return
            }
            res.status(200).json(owner)
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

//this middleware check if the owner Id exists and pass call the next middleware if true
router.use('/:ownerId/pets/:petId', (req, res, next) => {
    Owner.findById(req.params.ownerId, {pets: 0})
    .then((owner) => {
        if (!owner) {
            res.status(404).send({ message: 'Owner not found' })
            return
        }
        req.body.ownerObject = owner
        return owner.pets.includes(req.params.petId) //check if the pet exists in the owner's pets lists
            ? next()
            : res.status(404).json({ message: `the pet does not exist in the owner's pets lists` })
    })
    .catch(err => {
        res.status(500).send({ message: err.message })
    }) 
})
// Display a single pet for an owner
router.get('/:ownerId/pets/:petId', (req, res) => {
    console.log(req.body.ownerObject)
    Owner.findById(req.params.ownerId)
        .then((owner) => {
            Pet.findById(req.params.petId)
                .then(pet => {
                    res.status(200).send(pet)
                })
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

// Display a form for editing an owners pet
router.get('/:ownerId/pets/:petId/edit', (req, res) => {
    res.status(200).render('editpet')
})

// Edit an owners pet when a form is submitted
router.get('/:ownerId/pets/:petId', (req, res) => {
    Pet.findByIdAndUpdate(req.body.petname)
        .then(pet => {
            res.status(200).send(pet)
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
})

// DELETE
// /owners/:ownerId/pets/:petId
// Delete an owners pet when a form is submitted

module.exports = router

