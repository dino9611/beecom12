const express=require('express')
const bodyparser=require('body-parser')
const cors=require('cors')
const bearertoken=require('express-bearer-token')
const app=express()


const PORT=5000
app.use(cors())//izin ke frontend apapun buat akses backend
app.use(bearertoken())
app.use(bodyparser.json())//buat user kirim data ke server
app.use(bodyparser.urlencoded({ extended: false }));//buat user kirim data ke server
app.use(express.static('public'))


app.get('/',(req,res)=>{
    res.send('<h1>selemat datang di Api Ecoomerce jc12 1.0</h1>')
})

const {AuthRouters,ProductRouters} = require('./routers')

app.use('/users',AuthRouters)
app.use('/product',ProductRouters)

app.listen(PORT,()=>console.log(`Api jalan di PORT ${PORT}`))