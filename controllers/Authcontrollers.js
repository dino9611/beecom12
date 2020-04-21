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
    verifieduser:(req,res)=>{
        const {id}=req.user
        var obj={
            isverified:1
        }
        var sql=`update users set ? where id=${id}`
        db.query(sql,obj,(err,result)=>{
            if(err) return res.status(500).send(err)
            sql=`select * from users where id=${id}`
            db.query(sql,(err,result1)=>{
                if (err) return res.status(500).send(err)
                return res.status(200).send(result1[0])
            })
        })
    },
    sendemailverified:(req,res)=>{
        const {userid,username,email}=req.body
        const token=createJWTToken({id:userid,username:username})
        var LinkVerifikasi=`http://localhost:3000/verified?token=${token}`
        var mailoptions={
            from:'Hokage <aldinorahman36@gmail.com>',
            to:email,
            subject:'Misi Level A verified ulang',
            html:`tolong klik link ini untuk verifikasi :
            <a href=${LinkVerifikasi}>Minimales verified</a>`
        }
        transporter.sendMail(mailoptions,(err,result2)=>{
            if (err) return res.status(500).send(err)
            return res.status(200).send({pesan:true})
        })
    },
    login:(req,res)=>{
        const {username,password}=req.query
        var sql=`select * from users where username='${username}' and password='${encrypt(password)}'`
        db.query(sql,(err,result)=>{
            if(err) return res.status(500).send(err)
            if(result.length){
                sql=`select count(*) as jumlahcart from transactions t 
                join transactiondetails td on t.id=td.transactionid 
                where t.userid=${result[0].id} and t.status='oncart'`
                db.query(sql,(err,result1)=>{
                    if(err) return res.status(500).send(err)
                    const token=createJWTToken({id:result[0].id,username:result[0].username})
                    res.status(200).send({...result[0],jumlahcart:result1[0].jumlahcart,status:true,token:token})
                })
            }else{
                return res.status(200).send({status:false})
            }
        })
    },
    keeplogin:(req,res)=>{
        // console.log(req.user)
        var sql=`select * from users where id=${req.user.id}`
        db.query(sql,(err,result)=>{
            if(err){
                return res.status(500).send(err)
            }
            sql=`select count(*) as jumlahcart from transactions t 
            join transactiondetails td on t.id=td.transactionid 
            where t.userid=${result[0].id} and t.status='oncart'`
            db.query(sql,(err,result1)=>{
                if(err) return res.status(500).send(err)
                const token=createJWTToken({id:result[0].id,username:result[0].username})
                res.status(200).send({...result[0],jumlahcart:result1[0].jumlahcart,token:token})
            })
        })
    },
    loginfacebook:(req,res)=>{
        const {username,email}=req.body
        var sql=`select * from users where username='${username}' and email='${email}'`
        db.query(sql,(err,result)=>{
            if(err){
                return res.status(500).send(err)
            }
            if(result.length){
                sql=`select count(*) as jumlahcart from transactions t 
                join transactiondetails td on t.id=td.transactionid 
                where t.userid=${result[0].id} and t.status='oncart'`
                db.query(sql,(err,result1)=>{
                    if(err) return res.status(500).send(err)
                    const token=createJWTToken({id:result[0].id,username:result[0].username})
                    return res.status(200).send({...result[0],jumlahcart:result1[0].jumlahcart,token:token})
                })
            }else{
                var data={
                    username,
                    email,
                    lastlogin: new Date(),
                    isfacebook:1,
                    isverified:1
                }
                sql=`insert into users set ?`
                db.query(sql,data,(err,result1)=>{
                    if(err){
                        return res.status(500).send(err)
                    }
                    const token=createJWTToken({id:result1.insertId,username:username})
                    sql=`select * from users where id=${result1.insertId}`
                    db.query(sql,(err,result3)=>{
                        if (err) return res.status(500).send(err)
                        return res.status(200).send({...result3[0],token,jumlahcart:0})
                    })
                })
            }
        })
    }
}