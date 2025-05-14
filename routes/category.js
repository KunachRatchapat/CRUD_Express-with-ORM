const express = require('express')
const router = express.Router()
const { create ,list,remove} = require('../controllers/category')

//Endpoint localhost:5000/api/category
router.post('/category',create) //Create Category
router.get('/category',list)    //Create List ShowWebsite
router.delete('/category/:id',remove) //Delete item




module.exports = router