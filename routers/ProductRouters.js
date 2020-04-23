const express=require('express')
const {ProductControllers}=require('./../controllers')
const {auth}=require('./../helper/Auth')

const router=express.Router()

router.get('/category',ProductControllers.getcategory)
router.post('/addprod',auth,ProductControllers.addproduct)
router.get('/getprod',ProductControllers.getproduct)
router.delete('/deleteprod/:id',ProductControllers.deleteproduct)
router.put('/editprod/:id',auth,ProductControllers.editProduct)

module.exports=router