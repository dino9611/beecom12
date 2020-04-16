const express=require('express')
const {AuthControllers}=require('./../controllers')


const router=express.Router()


router.post('/register',AuthControllers.register)




module.exports=router