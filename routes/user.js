const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');
const dateTime = require('node-datetime');
const {titleNormalize} = require('../database/title_normalize')
const getUserData = (id) => 
{
    return new Promise((resolve, reject) => 
    {
        db.query('SELECT * FROM user WHERE id = ?', [id], (err, data) => {
            if (err)
            {
                reject(err)
            }
            resolve(data[0])
        });
    })
}
router.get('/write', async (req,res) => {
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        const isAdmin = verify(tokenKey,'secret').isAdmin;
        const userId = verify(tokenKey,'secret').id;
        const userData = await getUserData(userId);
        const userName = userData.userName;
        if(!isAdmin)
        {
            res.render('../views/ejs/user_write.ejs', 
            {
                userId: userId,
                userName: userName
            });
        } else 
            res.redirect('/login');
    } else 
        res.redirect('/login');
})

router.post('/saveblog', async (req,res) => {
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        const isAdmin = verify(tokenKey,'secret').isAdmin;
        const userId = verify(tokenKey,'secret').id;
        const userData = await getUserData(userId);
        const userName = userData.userName;
        if(!isAdmin)
        {
            const {title, summary, content} = req.body;
            titleURL = titleNormalize(title);
            db.query("SELECT * FROM post WHERE titleURL = ?", [titleURL], (error, result) => {
                if(result.length > 0)
                {
                    return res.render('../views/ejs/user_write.ejs', 
                    {
                        userId: userId,
                        userName: userName,
                        message : 'Tiêu đề này đã được thêm vào trước đây mới bạn đặt lại tiêu đề'
                    })
                }
                var dt = dateTime.create();
                dt.offsetInHours(7);
                dt = dt.format('Y-m-d H:M:S');
                db.query("INSERT INTO post SET ?", {authorID:userId, title:title, titleURL:titleURL, summary:summary, content:content, createdAt:dt},(error,result)=>
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

module.exports = router;