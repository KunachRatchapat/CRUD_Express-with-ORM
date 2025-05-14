const express = require('express')
const router = express.Router()
const { create , list,read,update, remove,listby,searchFilters } = require('../controllers/product')


//Endpoint
router.post('/product',create)
router.get('/products/:count',list)
router.get('/product/:id',read)
router.put('/product/:id',update)
router.delete('/product/:id',remove)
router.post('/productby',listby) //เรียงตามสินค้าที่ขายดีที่สุด หรือ สินค้าที่ใหม่ที่สุด
router.post('/search/filters',searchFilters)


module.exports = router