const  express = require('express')
const mongoose = require('mongoose')
const  logger = require('morgan') 
const helmet = require('helmet');
require('dotenv').config({path: './.env'})
const owners = require('./routes')

const app = express()
const port = process.env.PORT || 3000

//mongodb connection
mongoose.connect(process.env.URI)
    .then(result => {
        console.log("connected to db Pets_App successfully")
    })
    .catch(err => { console.log(err.message) })


//necessary middlewares using global level middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logger(":method :url :status :res[content-length] - :response-time ms - :remote-user :date"))
app.use(helmet())

app.use('/owners', owners)


app.set('view engine', 'pug');
app.set('views', './views');

app.use('/', (req,res) =>{
    res.json({ message : 'invalid request'})
})
app.listen(port, ()=>{
    console.log(`app listening on port ${port}`);
})


