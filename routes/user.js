const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');
const dateTime = require('node-datetime');
const {titleNormalize} = require('../database/title_normalize')
const string_of_renderfile_user_profile = require('../fs/user_profile');

router.get('/write',(req,res)=>{
    const tokenKey = req.session.tokenKey;
    if(tokenKey)
    {
        var isAdmin = verify(tokenKey,'secret').isAdmin;
        if(!isAdmin)
        {
            res.render('../views/hbs/user_write.hbs');
        }else res.redirect('/login');
    }else res.redirect('/login');
})

router.post('/saveblog',(req,res)=>{
    const tokenKey = req.session.tokenKey;
    if(tokenKey)
    {
        var email = verify(tokenKey,'secret').email;
        var isAdmin = verify(tokenKey,'secret').isAdmin;
        var userId = verify(tokenKey,'secret').id;
        if(!isAdmin)
        {
            const {title,content} = req.body;
            titleURL = titleNormalize(title);
            db.query("SELECT * FROM post WHERE titleURL = ?", [titleURL], (error,result) => {
                if(result.length>0)
                {
                    return res.render('../views/hbs/user_write.hbs', {message : 'Tiêu đề này đã được thêm vào trước đây mới bạn đặt lại tiêu đề'})
                }
                var dt = dateTime.create().format('Y-m-d H:M:S');
                db.query("INSERT INTO post SET ?", {authorID:userId, title:title, titleURL:titleURL, content:content, createdAt:dt},(error,result)=>
                {
                    if (error)
                    {
                        console.log('Fuck offf')
                        console.log(error)
                    }
                    return res.redirect('/homepage/user');
                })
            })
        }else res.redirect('/login');
    }else res.redirect('/login');
});

router.get('/profile',(req,res)=>{
    const tokenKey = req.session.tokenKey;
    if(tokenKey)
    {
        var email = verify(tokenKey,'secret').email;
        var isAdmin = verify(tokenKey,'secret').isAdmin;
        var userId = verify(tokenKey,'secret').id;
        if(!isAdmin)
        {
            var html = "";
            db.query("SELECT * FROM post WHERE authorId = ?", [userId], (error,result) => {
                for(var ob of result) html = 
                `<button class="accordion">${ob.title}</button>
                <div class="panel">
                  <p>${ob.content}</p>
                </div>`+html;
                return res.send(string_of_renderfile_user_profile.left+ `<h4>Các bài viết của ${email}<\h4>`+ html + string_of_renderfile_user_profile.right);
            })
        }else res.redirect('/login');
    }else res.redirect('/login');
})

router.get('/deleteblog',(req,res)=>{
    const tokenKey = req.session.tokenKey;
    if(tokenKey)
    {
        var isAdmin = verify(tokenKey,'secret').isAdmin;
        if(!isAdmin)
        {
            return res.render('../views/hbs/user_deleteblog.hbs');
        }else res.redirect('/login');
    }else res.redirect('/login');
})

router.post('/resaveblog',(req,res)=>{
    const tokenKey = req.session.tokenKey;
    if(tokenKey)
    {
        var isAdmin = verify(tokenKey,'secret').isAdmin;
        var email = verify(tokenKey,'secret').email;
        if(!isAdmin)
        {
            var {title} = req.body;
            titleURL = titleNormalize(title)
            db.query('SELECT * FROM blog WHERE titleURL = ?',[titleURL],(err,result)=>{
                if(result.length <= 0)
                {
                    return res.render('../views/hbs/user_deleteblog.hbs',{message : 'Không tồn tại bài viết có tiêu đề như thế'});
                }

                if(result[0].email != email)
                {
                    return res.render('../views/hbs/user_deleteblog.hbs',{message : 'Bài viết này không phải là của bạn'});
                }
                db.query('DELETE FROM post WHERE titleURL = ?',[titleURL],(err,result)=>{
                    if(err) console.log(err);
                });
                return res.render('../views/hbs/user_deleteblog.hbs',{message : 'Bạn đã xóa bài viết thành công!'});
            })

        } else res.redirect('/login');
    } else res.redirect('/login');
})

module.exports=router;