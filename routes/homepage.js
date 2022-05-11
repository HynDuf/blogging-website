const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');
const nav_bar_file = require('../fs/nav');
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

router.get('/', async (req,res) =>
{
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        const isAdmin = verify(tokenKey,'secret').isAdmin;
        const userId = verify(tokenKey,'secret').id;
        const userData = await getUserData(userId);
        const userName = userData.userName;
        let nav_bar = "";
        if (isAdmin)
            nav_bar = nav_bar_file.admin;
        else 
            nav_bar = nav_bar_file.user;
        db.query('SELECT * FROM post ORDER BY createdAt DESC', async (err, result) => {
            const getHTMLBlog = async (ob) =>
            {   
                const userDataTem = await getUserData(ob.authorId);
                const authorEmail = userDataTem.email;
                let extraButtonHTML = "";
                if (isAdmin || userId == ob.authorId)
                    extraButtonHTML = 
                    `
                    <a href="/blog/edit/${ob.titleURL}" class="btn btn-warning"> Edit </a>
                    <button class="btn btn-danger" onclick="confirmDelete('/blog/delete/${ob.titleURL}')"> Delete </button>
                    `;
                else 
                    extraButtonHTML = ``;
                return `
                <div class="card mt-4">
                    <div class="card-body">
                        <h4 class="card-title"> ${ob.title} - <a href="/users/${ob.authorId}">${authorEmail}</a> </h4> 
                        <div class="card-subtitle text-muted mb-2">
                            ${ob.createdAt.toISOString().replace('T', ' ').substr(0, 19)}
                        </div>
                        <div class="card-text mb-2"> 
                            ${ob.summary}
                        </div>
                        <a href="/blog/view/${ob.titleURL}" class="btn btn-primary"> Read More </a>
                `
                + extraButtonHTML
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
                return res.render('../views/ejs/homepage.ejs', {
                    nav_bar: nav_bar,
                    userId: userId,
                    userName: userName,
                    listOfBlogs: data
                })
            })
        })
    }
    else res.redirect('/login');
});

router.get('/search', async (req,res) =>
{
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        const isAdmin = verify(tokenKey,'secret').isAdmin;
        const userId = verify(tokenKey,'secret').id;
        const userData = await getUserData(userId);
        const userName = userData.userName;
        const searchString = req.query.searchString;
        const wordList = searchString.trim().split(/[ ,]+/); 
        var searchStringQuery = wordList.join('|');
        let nav_bar = "";
        if (isAdmin)
            nav_bar = nav_bar_file.admin;
        else 
            nav_bar = nav_bar_file.user;
        db.query(`SELECT * FROM post WHERE title REGEXP '${searchStringQuery}' 
                                        OR summary REGEXP '${searchStringQuery}' 
                                        OR titleURL REGEXP '${searchStringQuery}'
                                     ORDER BY createdAt DESC`, async (err, result) => {
            if (err)
            {
                console.log(err)
                return
            }
            const getHTMLBlog = async (ob) =>
            {   
                const userDataTem = await getUserData(ob.authorId);
                const authorEmail = userDataTem.email;
                let extraButtonHTML = "";
                if (isAdmin || userId == ob.authorId)
                    extraButtonHTML = 
                    `
                    <a href="/blog/edit/${ob.titleURL}" class="btn btn-warning"> Edit </a>
                    <button class="btn btn-danger" onclick="confirmDelete('/blog/delete/${ob.titleURL}')"> Delete </button>
                    `;
                else 
                    extraButtonHTML = ``;
                return `
                <div class="card mt-4">
                    <div class="card-body">
                        <h4 class="card-title"> ${ob.title} - <a href="/users/${ob.authorId}">${authorEmail}</a> </h4> 
                        <div class="card-subtitle text-muted mb-2">
                            ${ob.createdAt.toISOString().replace('T', ' ').substr(0, 19)}
                        </div>
                        <div class="card-text mb-2"> 
                            ${ob.summary}
                        </div>
                        <a href="/blog/view/${ob.titleURL}" class="btn btn-primary"> Read More </a>
                `
                + extraButtonHTML
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
                return res.render('../views/ejs/homepage.ejs', {
                    nav_bar: nav_bar,
                    userId: userId,
                    userName: userName,
                    listOfBlogs: data
                })
            })
        })
    } 
    else 
        res.redirect('/login');

})

module.exports = router;
