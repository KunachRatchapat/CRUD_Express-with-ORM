const prisma = require("../config/prisma")


// Endpoint Add product
exports.create = async(req,res) => {
    try{
        const { title, description,price,categoryId,quantity,images} = req.body
        //console.log(title, description,price,quantity,images)
        const product = await prisma.product.create({
            data:{
                title:title,
                description:description,
                price:parseFloat(price),
                quantity:parseInt(quantity),
                categoryId:parseInt(categoryId),
                images:{
                    create:images.map((item)=>({
                         asset_id:  item.asset_id,
                         public_id: item.public_id,
                         url:       item.url,
                         secure_url:item.secure_url 
                    }))
                }
            }
        })

        res.send(product)

    }catch(err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}

// Endpoint Show quantity Products
exports.list = async(req,res) => {
    try{
        const { count } = req.params
        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: {createdAt: "desc" },
            include:{
                category:true,
                images:true
            }
        }) 
        res.send(products)

    }catch(err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}

// Endpoint Show 1 product
exports.read = async(req,res) => {
    try{
        const { id } = req.params
        const products = await prisma.product.findFirst({
            where:{
                id:Number(id)
            },
        
            include:{
                category:true,
                images:true
            }
        }) 
        res.send(products)

    }catch(err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}

// Endpoint Update Product
exports.update = async(req,res) => {
    try{
        const { title, description,price,categoryId,quantity,images} = req.body
        //console.log(title, description,price,quantity,images)

        //Delete Images
        await prisma.image.deleteMany({
            where:{
                productId:Number(req.params.id)
            }
        })


        const product = await prisma.product.update({
            where:{
                id:Number(req.params.id)
            },
            data:{
                title:title,
                description:description,
                price:parseFloat(price),
                quantity:parseInt(quantity),
                categoryId:parseInt(categoryId),
                images:{
                    create:images.map((item)=>({
                         asset_id:  item.asset_id,
                         public_id: item.public_id,
                         url:       item.url,
                         secure_url:item.secure_url 
                    }))
                }
            }
        })
        res.send(product)

    }catch(err){
        res.status(500).json({ message : "Server Error !!"})
    }

}

// Endpoint Delete Product
exports.remove = async(req,res) => {
    try{
        const { id } = req.params
        await prisma.product.delete({
            where:{
                id:Number(id)

            }
        })
        res.send("Deleted Success")

    }catch(err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}

//Endpoint List Showproduct
exports.listby = async(req,res) => {
    try{
        const {sort,order,limit} = req.body
        console.log(
            sort,   //เลือกเอาจะใช้ตัวแปรไหนในการ sort
            order,  //เรียงว่าจากใหม่หรือเก่า
            limit   //กำหนดจำนวนที่ต้องการจะโชว์
        )
        const products = await prisma.product.findMany({
            take:limit,
            orderBy:{ [sort]:order },
            include:{ category: true }
        })


        res.send(products)

    }catch(err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}

//Handle Search query
const handleQuery = async(req,res,query)=>{
    try{
        const products = await prisma.product.findMany({
            where:{
                title: {
                    contains: query,
                }
            },
            //Connect New Db
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)

    }catch (err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}

//Handle Price
const handlePrice = async(req,res,priceRange)=>{
    try{
        const products = await prisma.product.findMany({
            where:{
                price:{
                    gte:priceRange[0], //ราคาเริ่มต้น
                    lte:priceRange[1]  //ราคาสูงสุด
                }
            },
            include:{
                category: true,
                images: true
            }
        })

        res.send(products)

    }catch(err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}

//handle Category
const handleCategory = async(req,res,categoryId)=>{
    try{
        const products = await prisma.product.findMany({
            where:{
                categoryId:{
                    in:categoryId.map((id)=> Number(id)) //loop id 
                }
                
            },
            include:{
                category:true,
                images:true
            }
        })
        res.send(products)
    }catch(err){
        console.log(err)
        res.status(500).json({ message:"Server Error !!"})
    }
}

//Endpoint SearchFilters
exports.searchFilters = async(req,res) => {
    try{
        const { query, category, price} = req.body

        if(query){
            console.log('query-->',query)
            await handleQuery(req,res,query)
        }

        if(category){
            console.log('category-->',category)
            await handleCategory(req,res,category)
            
        }

        if(price){
            console.log('price-->',price)
            await handlePrice(req,res,price)
        }



    }catch(err){
        console.log(err)
        res.status(500).json({ message :"Server Error !!"})
    }
}