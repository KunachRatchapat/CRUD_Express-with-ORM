
const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs') //For use path
const cors = require('cors')


//MiddleWare
app.use(morgan('dev'))
app.use(express.json()) //ให้อ่าน JSON ให้ออก
app.use(cors())

//ReaddirSync Read path
readdirSync('./routes')
.map((c)=> app.use('/api',require('./routes/'+c)))


//Router
/*app.post('/api',(req,res)=>{
    //code
    const { username , password} = req.body //Destruc
    console.log(username,password)
    res.send("Hello Broo!")
})*/



app.listen(5000 , ()=> console.log("Server is Running on port 5000"))