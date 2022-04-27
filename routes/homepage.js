const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');
const render_homepage = require('../fs/user_homepage');
const render_homepage_admin = require('../fs/admin_homepage');

router.get('/admin', (req,res)=>
{
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        const {email,isAdmin} = verify(tokenKey,'secret');
        if(isAdmin)
        {
            db.query('SELECT * FROM post', async (err,result)=>{
                const getAuthorEmail = (authorId) => 
                {
                    return new Promise((resolve, reject) => 
                    {
                        db.query('SELECT email FROM user WHERE id = ?', [authorId], (err, data) => {
                            if (err)
                            {
                                reject(err)
                            }
                            resolve(data[0].email)
                        });
                    })
                }
                const getHTMLBlog = async (ob) =>
                {   
                    const authorEmail = await getAuthorEmail(ob.authorId);
                    return `
                    <div class="card mt-4">
                        <div class="card-body">
                            <h4 class="card-title"> ${ob.title} - ${authorEmail} </h4>
                            <div class="card-subtitle text-muted mb-2">
                                ${ob.createdAt.toISOString().replace('T', ' ').substr(0, 19)}
                            </div>
                            <div class="card-text mb-2"> 
                                ${ob.summary}
                            </div>
                            <a href="../blog/${ob.titleURL}" class="btn btn-primary"> Read More </a>
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
                    return res.send(render_homepage_admin.left + data + render_homepage_admin.right);
                })
            })
        }
        else res.redirect('/login');
    }
    else res.redirect('/login');
});

router.get('/user',(req,res)=>
{
    const tokenKey = req.session.tokenKey;
    if(tokenKey)
    {
        const {email,isAdmin} = verify(tokenKey,'secret');
        if(!isAdmin)
        {
           
            db.query('SELECT * FROM post', async (err, result)=>{
                const getAuthorEmail = (authorId) => 
                {
                    return new Promise((resolve, reject) => 
                    {
                        db.query('SELECT email FROM user WHERE id = ?', [authorId], (err, data) => {
                            if (err)
                            {
                                reject(err)
                            }
                            resolve(data[0].email)
                        });
                    })
                }
                const getHTMLBlog = async (ob) =>
                {   
                    const authorEmail = await getAuthorEmail(ob.authorId);
                    return `
                    <div class="card mt-4">
                        <div class="card-body">
                            <h4 class="card-title"> ${ob.title} - ${authorEmail} </h4>
                            <div class="card-subtitle text-muted mb-2">
                                ${ob.createdAt.toISOString().replace('T', ' ').substr(0, 19)}
                            </div>
                            <div class="card-text mb-2"> 
                                ${ob.summary}
                            </div>
                            <a href="../blog/${ob.titleURL}" class="btn btn-primary"> Read More </a>
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
                    return res.send(render_homepage.left + data + render_homepage.right);
                })
            })
        }
        else res.redirect('/login');
    }
    else res.redirect('/login');
});


module.exports = router;