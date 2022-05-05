const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();
const db = require('../database/database');
const dateTime = require('node-datetime');
const marked = require('marked')
const renderer = new marked.Renderer();
renderer.heading = (text, level) => `<h${level}>${text}</h${level}>`;
marked.setOptions({renderer});
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const DOMPurify = createDOMPurify(new JSDOM('').window);
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
const getPostData = async (url) => 
{
    return new Promise((resolve, reject) => 
    {
        db.query('SELECT * FROM post WHERE titleUrl = ?', [url], (err, data) => {
            if (err)
            {
                reject(err)
            }
            resolve(data[0])
        });
    })
}

const getAllComments = async (postId) => 
{
    return new Promise((resolve, reject) => 
    {
        db.query("SELECT * FROM post_comment WHERE postId = ? ORDER BY createdAt", [postId], async (err, res) => {
            if (err)
                reject(err)
            resolve(res)
        });
    })
}

const buildCommentSection = async (postId, postUrl) => 
{
    const commentsRaw = await getAllComments(postId);
    const commentList = {}
    const comments = {}
    for (let i = 0; i < commentsRaw.length; i++)
        comments[commentsRaw[i].id] = commentsRaw[i];
    for (let i = 0; i < commentsRaw.length; i++)
        commentList[commentsRaw[i].id] = []
    rootComments = [];
    for (let i = 0; i < commentsRaw.length; i++)
    {
        if (commentsRaw[i].parentId)
            commentList[commentsRaw[i].parentId].push(commentsRaw[i].id);
        else 
            rootComments.push(commentsRaw[i].id);
    }
    html = "";
    for (var id in rootComments)
    {
        html += await dfsComment(rootComments[id], commentList, comments, 0, postUrl);
    }
    return html;
}

const dfsComment = async (id, commentList, comments, height, postUrl) => 
{
    const userData = await getUserData(comments[id].userId);
    const userName = userData.userName;
    const userEmail = userData.email;
    html = 
    `
    <div class="card mt-2" style="margin-left:${30 + height * 50}px; margin-right:30px; margin-bottom:10px">
        <form method="POST" action="${postUrl}/comment/${comments[id].id}">
            <div class="card-body">
                <div class="username"> ${userName} - <a href="/users/${comments[id].userId}"> ${userEmail} </a> </div>
                <div class="time"> ${comments[id].createdAt.toISOString().replace('T', ' ').substr(0, 19)} </div>
                <div class="user-comment"> ${comments[id].content} </div>
                <div class="reply"> <a href="javascript:void(0)" onclick="reply(this)"> REPLY </a> </div>
                
            </div>
        </form>
    </div>
    `
    for (var i in commentList[id])
    {
        html += await dfsComment(comments[commentList[id][i]].id, commentList, comments, height + 1, postUrl);
    }
    return html;
}

router.get('/:titleURL', async (req, res) => 
{
    const tokenKey = req.session.tokenKey;
    let nav_bar = nav_bar_html.oth;
    let userName = "";
    if (tokenKey)
    {
        const isAdmin = verify(tokenKey,'secret').isAdmin;
        const userId = verify(tokenKey,'secret').id;
        const userData = await getUserData(userId);
        if (isAdmin) 
            nav_bar = nav_bar_html.admin;
        else 
            nav_bar = nav_bar_html.user;
        userName =
        `
        <i class="fa-solid fa-user"></i>
        <a href="/users/${userId}" class="usersection"> ${userData.userName}</a>
        `
    }
    const {titleURL} = req.params;
    db.query("SELECT * FROM post WHERE titleURL = ?", [titleURL], async (error, result) => {
        if(result.length <= 0)
        {
            return res.status(404).redirect('/homepage')
        }
        
        const user = await getUserData(result[0].authorId);
        const commentSection = await buildCommentSection(result[0].id, titleURL);
        
        return res.render('../views/ejs/blog.ejs', {
            nav_bar: nav_bar,
            userName: userName,
            title: result[0].title,
            content: DOMPurify.sanitize(marked.parse(result[0].content)),
            authorId: result[0].authorId,
            authorEmail: user.email,
            createdAt: result[0].createdAt.toISOString().replace('T', ' ').substr(0, 19),
            commentSection: commentSection,
            postUrl: titleURL
        })
    })
})

router.post('/:postUrl/comment', async (req, res) => 
{
    const {commentContent} = req.body;
    const {postUrl} = req.params;
    const postData = await getPostData(postUrl);
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        var userId = verify(tokenKey,'secret').id;
        var dt = dateTime.create();
        dt.offsetInHours(7);
        dt = dt.format('Y-m-d H:M:S');
        db.query('INSERT INTO post_comment SET ?', {postId:postData.id, userId:userId, content:commentContent, createdAt:dt}, (error, result) => 
        {
            if (error)
            {
                console.log(error);
            }
            return res.redirect(`/blog/${postUrl}`);
        })
    } else 
        res.redirect('/login');
})

router.post('/:postUrl/comment/:parentId', async (req, res) => 
{
    const {commentContent} = req.body;
    const {postUrl, parentId} = req.params;
    const postData = await getPostData(postUrl);
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        const userId = verify(tokenKey,'secret').id;
        var dt = dateTime.create();
        dt.offsetInHours(7);
        dt = dt.format('Y-m-d H:M:S');
        db.query('INSERT INTO post_comment SET ?', {postId:postData.id, userId:userId, parentId:parentId, content:commentContent, createdAt:dt}, (error, result) => 
        {
            if (error)
            {
                console.log(error);
            }
            return res.redirect(`/blog/${postUrl}`);
        })
    } else 
        res.redirect('/login');
})

router.get('/delete/:postUrl', async (req, res) => 
{
    const tokenKey = req.session.tokenKey;
    if (tokenKey)
    {
        const isAdmin = verify(tokenKey,'secret').isAdmin;
        const userId = verify(tokenKey,'secret').id;
        const {postUrl} = req.params;
        const postData = await getPostData(postUrl);
        if (!isAdmin && userId != postData.id)
            res.redirect('/homepage/user');
        db.query('DELETE FROM post WHERE titleURL = ?', [postUrl], (err,result)=>{
            if(err) console.log(err);
        });
        if (isAdmin)
            res.redirect('/homepage/admin');
        else 
            res.redirect('/homepage/user'); 
    } else 
        res.redirect('/login');
})
module.exports=router;
