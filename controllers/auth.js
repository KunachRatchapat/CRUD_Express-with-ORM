const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')

exports.register = async(req,res) =>{

    try{
        const {email , password} = req.body

        //Step 1 Validate body
        if(!email){
            res.status(400).json({ message : "Email is Required!!"})
        }
        if(!password){
            res.status(400).json({ message : "Password is Reqiured!!"})
        }

        //Step2 Check in Database is Already?
        const user = await prisma.user.findFirst({
            where:{
                email:email
            }
        })

        //if user have E-mail send Front Youhave
        if(user){
            return res.status(400).json({ message:"Email is Already exits!!"})

        }
        //step 3 Hashpassword
        const hashPassword = await bcrypt.hash(password,10)
        console.log(hashPassword)

        //step 4 Register on Usertable in DB
        await prisma.user.create({
            data:{
                email: email,
                password: hashPassword
            }
        })


        
        res.send("Register Suscess")

    } catch(err) {
        console.log(err)
        res.status(500).json({ message : "Server Error!!"})
    }
    
} 

exports.login = async(req,res) =>{
    //code
    try{
        const { email,password } = req.body

        //check Email Firt on Db
        const user = await prisma.user.findFirst({
            where:{
                email: email 
            }
        })
        //chek user and return if not Correct
        if(!user || !user.enabled){
            return res.status(400).json({ message:"User not found and not Enable"})
        }

        //Check password
        const isMatch = await bcrypt.compare(password,user.password)
        //Condition return if not Correct
        if(!isMatch){
            return res.status(400).json({ message: "Password Invalide !!"})
        }

        //Create Payload
        const payload ={
            id: user.id,
            email: user.email,
            role: user.role

        }

        //Step 4 Generate Token
        jwt.sign(payload, process.env.SECRET, { 
            expiresIn:'7d'},
            (err,token) => {
                if(err){
                    return res.status(500).json({ message:"Server Error"})
                }

                res.json({payload,token})
            })  
       

    } catch(err) {
        console.log(err)
        res.status(500).json({ message : "Server Error"})
    }
}

exports.currentUser = async(req,res)=>{
    try {
        res.send("Hello Current User")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message : "Server Error!!"})
    }
}

