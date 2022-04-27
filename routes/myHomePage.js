const express = require('express');
const { verify } = require('jsonwebtoken');
const router = express.Router();

router.get('/myHomePage', (req,res) => 
{
    const tokenKey = req.session.tokenKey;
    // console.log(tokenKey);
    if (tokenKey)
    {
        const {email,isAdmin} = verify(tokenKey,'secret');
        if (!isAdmin) res.redirect('/homepage/user');
        else         res.redirect('/homepage/admin');
    }
    else res.redirect('/login');
});

router.get('/logout', (req,res) =>
{
    req.session.destroy();
    res.redirect('/login');
});
module.exports = router;