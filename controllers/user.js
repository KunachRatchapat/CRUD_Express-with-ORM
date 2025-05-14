const prisma = require("../config/prisma")


//Show User
exports.listUser = async(req,res)=>{
    try{
        const users = await prisma.user.findMany({
            select:{
                id:true,
                email:true,
                role:true,
                enabled:true,
                address:true
            }
        })
        res.json(users)

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//Change Status User
exports.changeStatus = async(req,res)=>{
    try{
        const { id , enabled } = req.body
        const users = await prisma.user.update({
            where:{ id : Number(id)},
            data:{ enabled : enabled}
        })
        res.send("Update Status Success")

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//Change Role User
exports.changeRole = async(req,res)=>{
    try{
        const { id , role } = req.body
        
        const users = await prisma.user.update({
            where:{ id : Number(id)},
            data:{ role : role}
        })
        
        res.send("Update Role Success")
    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//User Add Cart 
exports.userCart = async(req,res)=>{
    try{
        const { cart } = req.body
        console.log(cart)
        console.log(req.user.id)
        
        
        //Show user in DB
        const user = await prisma.user.findFirst({
            where:{ id : Number(req.user.id) }
        })
       
        
        //Deleted old on Cart item
        await prisma.productOnCart.deleteMany({
            where:{
                cart:{
                    orderedById:user.id
                }
            }
        })

        //Deleted old Cart
        await prisma.cart.deleteMany({
            where:{
                orderedById:user.id
            }
        })

        //Ready Item
        let products = cart.map((item) => ({
            productId: item.id,
            count: item.count,
            price: item.price
        }))

        //Sum Total
        let cartTotal = products.reduce((sum,item) => 
            sum+item.price *item.count,0)

        //New Cart In Db
        const newCart = await prisma.cart.create({
            data:{
                products: {
                    create:products
                },
                cartTotal:cartTotal,
                orderedById:user.id
            }
        })

        console.log(newCart)


        res.send("Add Cart Success")

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//User Show Cart
exports.getUserCart = async(req,res)=>{
    try{
        const cart = await prisma.cart.findFirst({
            where:{
                orderedById:Number(req.user.id)
            },
            include:{
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })
       // console.log(cart)
       //Sent in Frontend
        res.json({
            products:   cart.products,
            cartTotal:  cart.cartTotal
        })

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//User Delete Cart
exports.emptyCart = async(req,res)=>{
    try{
        //Find Id
        const cart = await prisma.cart.findFirst({
            where:{
                orderedById:Number(req.user.id)
            }
        })
        if(!cart){
            return res.status(400).json({ message:"No Cart" })
        }
        //Delete product on cart
        await prisma.productOnCart.deleteMany({
            where:{ cartId:cart.id }
        })

        const result = await prisma.cart.deleteMany({
            where:{
                orderedById:Number(req.user.id)
            }
        })

        console.log(result)
        res.json({
            message:"Cart Empty Success",
            deletedCount:result.count
        })

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//User Add Address
exports.saveAddress = async(req,res)=>{
    try{
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where:{
                id:Number(req.user.id)
            },
            data:{
                address:address
            }
        })


        res.json({ message:"Address update Success!"})

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//User Add Order
exports.saveOrder = async(req,res)=>{
    try{
        //Step1
        const userCart = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)     
            },
            include: { products:true }
        })

        //Check Cart Empty
        if(!userCart || userCart.products.length === 0){
            return res.status(400).json({   message:"Cart is Empty"   })
        }

        //Check quantity เข้าถึงแต่ละ object
        for(const item of userCart.products) {
            //console.log(item)
            const product = await prisma.product.findUnique({
                where:{ id : item.productId},
                select:{ quantity:true, title:true }
            })
           // console.log(item)
          //  console.log(product)

            //If No product for User
            if(!product || item.count > product.quantity){
                return res.status(400).json({ 
                    ok :false,
                    message: `ขออภัย สินค้า ${product?.title || 'product'}หมด`
                })
            }
        }
            
        //Create a new Order
        const order = await prisma.order.create({
            data: {
                products: {
                    create:userCart.products.map((item) => ({
                        productId:item.productId,
                        count:item.count,
                        price:item.price
                    }))
                },
                orderedBy:{
                    connect:{ id:req.user.id}
                },
                cartTotal:userCart.cartTotal
            }
        })
        
        //Update Product
        const update = userCart.products.map((item)=>({
            where:{ id: item.productId },
            //Update
            data: {
                quantity: { decrement:item.count },
                sold:{ increment: item.count}
            }
        }))
        console.log(update)

        await Promise.all(
            update.map((updateed)=> prisma.product.update(updateed))
        )

        await prisma.cart.deleteMany({
            where: {
                orderedById: Number(req.user.id)
            }
        })

        res.json({ ok:true,order})

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}

//User Show Order
exports.getOrder = async(req,res)=>{
    try{
        const orders = await prisma.order.findMany({
            where:{ orderedById:Number(req.user.id)},
            include: {
                products:{
                    include:{
                       product:true 
                    }
                }
            }
        })
        if(orders.length ===0) {
            return res.status(400).json({ok:false,message:"No order"})
        }
        res.json({ ok:true,orders})
        
        

    }catch(err){
        console.log(err)
        res.status(500).json({ message : "Server Error!!" })

    }
}