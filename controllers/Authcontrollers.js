const {db} =require('./../connections')
const transporter=require('./../helper/mailer')
const {createJWTToken}=require('./../helper/jwt')
const encrypt=require('./../helper/crypto')


module.exports={
    register:(req,res)=>{
        const {username,password,email}=req.body
        var sql=`select * from users where username='${username}'`
        db.query(sql,(err,result)=>{
            if (err) return res.status(500).send(err)
            if(result.length){
                return res.status(200).send({status:false})
            }
            sql=`insert into users set ?`
            var data={
                username:username,
                password:encrypt(password),
                email:email,
                lastlogin: new Date()
            }
            db.query(sql,data,(err,result1)=>{
                if (err) return res.status(500).send(err)
                const token=createJWTToken({id:result1.insertId,username:username})
                var LinkVerifikasi=`http://localhost:3000/verified?token=${token}`
                var mailoptions={
                    from:'Hokage <aldinorahman36@gmail.com>',
                    to:email,
                    subject:'Misi Level A verified',
                    html:`tolong klik link ini untuk verifikasi :
                    <a href=${LinkVerifikasi}>MInimales verified</a>`
                }
                transporter.sendMail(mailoptions,(err,result2)=>{
                    if (err) return res.status(500).send(err)
                    sql=`select * from users where id=${result1.insertId}`
                    db.query(sql,(err,result3)=>{
                        if (err) return res.status(500).send(err)
                        return res.status(200).send({...result3[0],token,status:true})
                    })
                })

            })
        })
    },
    login:(req,res)=>{

    }
}