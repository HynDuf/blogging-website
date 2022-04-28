const express = require('express');
const router = express.Router();
const db = require('../database/database');
const hashing = require('../database/hashing');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');

router.post('/register',(req,res) =>{
    const {email, password, passwordcomfirm} = req.body;
    db.query('SELECT email FROM user WHERE email = ?',[email],async (error,result)=>{
        if(error) console.log(error);
        if(result.length > 0) 
            return res.render('../views/hbs/register.hbs',{message:'Email đã được sử dụng'});
        if (password !== passwordcomfirm) 
            return res.render('../views/hbs/register.hbs',{message:'Mật khẩu nhập lại không chính xác'});
        passwordHash = hashing.hashpassword(password)
        db.query('INSERT INTO user SET?', {email:email, passwordHash:passwordHash});
        return res.render('../views/hbs/register.hbs',{message:'Bạn đã đăng kí thành công hãy đăng nhập'});
    })
});

router.post('/login', (req,res) => {
    const {email,password} = req.body;
    db.query('SELECT * FROM user WHERE email = ?', [email], async (error,result)=>
    {
        if(error) console.log(error);
        if(result.length <= 0) 
        {
            return res.render('../views/hbs/login.hbs',{message:'Email không tồn tại'});
        }
        if(!hashing.compare(password,result[0].passwordHash)) 
        {
            return res.render('../views/hbs/login.hbs',{message:"Sai mật khẩu"});
        }
        
        if(result[0].isBan === 1)
        {
            return res.render('../views/hbs/login.hbs',{message:"Tài khoản của bạn đã bị khóa!"});
        }
        const jsonObject = {email:email, id:result[0].id, isAdmin:result[0].isAdmin};

        const tokenKey = jwt.sign(jsonObject,'secret',{expiresIn: 8640});

        req.session.tokenKey = tokenKey;
        return res.redirect('/myHomePage');
    });
    console.log('done!');
})

module.exports = router;