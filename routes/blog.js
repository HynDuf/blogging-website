const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');
const marked = require('marked')
const renderer = new marked.Renderer();
renderer.heading = (text, level) => `<h${level}>${text}</h${level}>`;
marked.setOptions({renderer});
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const DOMPurify = createDOMPurify(new JSDOM('').window);
const nav_bar_html = require('../fs/nav')
router.get('/:titleURL', (req, res) => 
{
    const tokenKey = req.session.tokenKey;
    let nav_bar = nav_bar_html.oth;
    if(tokenKey)
    {
        var isAdmin = verify(tokenKey,'secret').isAdmin;
        if (isAdmin) 
            nav_bar = nav_bar_html.admin;
        else 
            nav_bar = nav_bar_html.user;
    }
    const {titleURL} = req.params;
    db.query("SELECT * FROM post WHERE titleURL = ?", [titleURL], async (error, result)=>{
        if(result.length <= 0)
        {
            return res.status(404).render('../views/hbs/admin_write.hbs',{message : 'Blog với tiêu đề này không tồn tại'})
        }
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
        const authorEmail = await getAuthorEmail(result[0].authorId);
        return res.render('../views/ejs/blog.ejs', {
            nav_bar: nav_bar,
            title: result[0].title,
            content: DOMPurify.sanitize(marked.parse(result[0].content)),
            authorEmail: authorEmail,
            createdAt: result[0].createdAt.toISOString().replace('T', ' ').substr(0, 19)
        })
    })
})

module.exports=router;
