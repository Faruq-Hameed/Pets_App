const joi = require('joi');

function ownerSchema (data){
    const schema = joi.object({
        ownername: joi.string().required()
    })
    return schema.validate(data)
}

function petSchema (data){
    const schema = joi.object({
        petname: joi.string().required()
    })
    return schema.validate(data)
}

module.exports = {petSchema, ownerSchema}