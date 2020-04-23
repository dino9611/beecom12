const {db}=require('./../connections')
const {uploader}=require('./../helper/uploader')
const fs=require('fs')

module.exports={
    getproduct:(req,res)=>{
        var sql=`select p.*,c.id as idcat,c.nama as catnama
        from products p join category c on p.kategoriid=c.id 
        where p.isdeleted=0`
        db.query(sql,(err,product)=>{
            if (err) res.status(500).send(err)
            sql=`Select id,nama from category`
            db.query(sql,(err,category)=>{
                if (err) res.status(500).send(err)
                return res.send({product,category})
            })
        })
    },
    addproduct:(req,res)=>{
        try {
            const path='/product'//ini terserah
            const upload=uploader(path,'PROD').fields([{ name: 'image'}])
            upload(req,res,(err)=>{
                if(err){
                    return res.status(500).json({ message: 'Upload picture failed !', error: err.message });
                }
                console.log('lewat')//pada tahap ini foto berhasil di upload
                const { image } = req.files;
                const imagePath = image ? path + '/' + image[0].filename : null;
                const data = JSON.parse(req.body.data); //json.parse mengubah json menjadi object javascript
                data.image=imagePath
                var sql=`insert into products set ?`
                db.query(sql,data,(err,result)=>{
                    if(err) {
                        fs.unlinkSync('./public' + imagePath);
                        return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
                    }
                    sql=`select p.*,c.id as idcat,c.nama as catnama
                            from products p join category c on p.kategoriid=c.id 
                            where p.isdeleted=0`
                    db.query(sql,(err,result1)=>{
                        if (err) res.status(500).send(err)
                        return res.status(200).send(result1)
                    })
                })
            })
        } catch (error) {
            return res.status(500).send(error)            
        }
    },
    deleteproduct:(req,res)=>{
        const {id}=req.params//req.params.id
        var sql=`select * from products where id=${id}`
        db.query(sql,(err,result)=>{
            if (err) res.status(500).send(err)
            if(result.length){
                var obj={
                    isdeleted:1,
                    image:null
                }
                sql=`Update products set ? where id=${id}`
                db.query(sql,obj,(err,result2)=>{
                    if (err) res.status(500).send(err)
                    console.log(result2)
                    if(result[0].image){
                        fs.unlinkSync('./public'+result[0].image)
                    }
                    sql=`select p.*,c.id as idcat,c.nama as catnama
                    from products p join category c on p.kategoriid=c.id 
                    where p.isdeleted=0`
                    db.query(sql,(err,result1)=>{
                        if (err) res.status(500).send(err)
                        return res.status(200).send(result1)
                    })
                })
            }else{
                return res.status(500).send({message:'nggak ada woy idnya'})
            }
        })
    },
    editProduct:(req,res)=>{
        const {id}=req.params
        var sql=`select * from products where id=${id}`
        db.query(sql,(err,result)=>{
            if (err) res.status(500).send(err)
            if(result.length){
                try {
                    const path='/product'//ini terserah
                    const upload=uploader(path,'PROD').fields([{ name: 'image'}])
                    upload(req,res,(err)=>{
                        if(err){
                            return res.status(500).json({ message: 'Upload post picture failed !', error: err.message });
                        }
                        console.log('lewat')
                        const { image } = req.files;
                        const imagePath = image ? path + '/' + image[0].filename : null;
                        const data = JSON.parse(req.body.data);
                        if(imagePath){
                            data.image = imagePath;
                        }
                        sql = `Update products set ? where id = ${id};`
                        db.query(sql,data,(err1,result1)=>{
                            if(err1) {
                                if(imagePath) {
                                    fs.unlinkSync('./public' + imagePath);
                                }
                                return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err1.message });
                            }
                            if(imagePath) {//hapus foto lama
                                if(result[0].image){
                                    fs.unlinkSync('./public' + result[0].image);
                                }
                            }
                            sql=`select p.*,c.id as idcat,c.nama as catnama
                                from products p join category c on p.kategoriid=c.id 
                                where p.isdeleted=0`
                            db.query(sql,(err,result2)=>{
                                if (err) res.status(500).send(err)
                                return res.status(200).send(result2)
                            })
                        })
                    })
                } catch (error) {
                    return res.status(500).send(error)            
                }
            }else{
                return res.status(500).send({message:'nggak ada woy idnya'})
            }
        })
    },
    getcategory:(req,res)=>{
        var sql=`Select id,nama from category`
        db.query(sql,(err,result)=>{
            if (err) res.status(500).send(err)
            return res.status(200).send(result)
        })
    }
}