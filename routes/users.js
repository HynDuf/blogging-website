const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');
const nav_bar_html = require('../fs/nav')
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
router.get('/:userId', async (req, res) => 
{
    const tokenKey = req.session.tokenKey;
    let userSection = "";
    let nav_bar = nav_bar_html.oth;
    let userOriginId = -1;
    if (tokenKey) 
    {
        const isAdmin = verify(tokenKey,'secret').isAdmin;
        const id = verify(tokenKey, 'secret').id;
        userOriginId = id;
        const userData = await getUserData(id);
        if (isAdmin) 
            nav_bar = nav_bar_html.admin;
        else 
            nav_bar = nav_bar_html.user;
        userSection =
        `
        <i class="fa-solid fa-user"></i>
        <a href="/users/${id}" class="usersection"> ${userData.userName}</a>
        `
    }
    const {userId} = req.params;
    const userDataTem = await getUserData(userId);
    const authorEmail = userDataTem.email;
    userDataSection = `
    <i class="fa-solid fa-user fa-5x" style="margin: 30px; margin-bottom: 10px;"></i>
    <h3 style="margin-left: 25px"> ${userDataTem.userName} </h3> 
    `
    db.query("SELECT * FROM post WHERE authorId = ?", [userId], (error,result) => {
        const getHTMLBlog = async (ob) =>
        {   
            if (userOriginId == userId)
                deleteButtonHTML = 
                `
                <a href="/blog/delete/${ob.titleURL}" class="btn btn-danger"> Delete </a>
                `;
            else 
                deleteButtonHTML = ``;
            return `
            <div class="card mt-4">
                <div class="card-body">
                    <h4 class="card-title"> ${ob.title} - <a href="/users/${userId}">${authorEmail}</a> </h4>
                    <div class="card-subtitle text-muted mb-2">
                        ${ob.createdAt.toISOString().replace('T', ' ').substr(0, 19)}
                    </div>
                    <div class="card-text mb-2"> 
                        ${ob.summary}
                    </div>
                    <a href="/blog/${ob.titleURL}" class="btn btn-primary"> Read More </a>
            `
            + deleteButtonHTML
            +
            `    
                </div>
            </div>
            `
        }
        const getAllHTMLBlog = async (data) => 
        {
            var html = "";
            for(var ob of data)
            {
                const htmlBlog = await getHTMLBlog(ob)
                html = html + htmlBlog
            }
            return html
        }
        getAllHTMLBlog(result).then(data => 
        {
            return res.render('../views/ejs/users_profile.ejs', {
                nav_bar: nav_bar,
                userSection: userSection,
                userDataSection: userDataSection,
                listOfBlogs: data
            })
        })
    })
})

module.exports = router;