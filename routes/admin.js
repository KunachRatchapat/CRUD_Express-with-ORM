const express = require('express')
const { authCheck } = require('../middlewares/authCheck')
const {getOrderAdmin, chageOrderStatus} = require('../controllers/admin')
const router = express.Router()


//Endpoint  localhost:5000/api/
router.put('/admin/order-status',authCheck,chageOrderStatus)
router.get('/admin/orders',authCheck,getOrderAdmin)








module.exports = router