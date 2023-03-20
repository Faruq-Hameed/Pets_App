const mongoose = require('mongoose');
const ownerSchema = new mongoose.Schema({
  name: {type: String, required: true},
  pets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet"
    }
  ]
},
{timestamps: true}
);

const petSchema = new mongoose.Schema({
  name: {type: String, required: true},
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner"
  }  
},
{timestamps: true}
);

const Pet = mongoose.model("Pet", petSchema);
const Owner = mongoose.model("Owner", ownerSchema);

module.exports = {Pet,Owner}

