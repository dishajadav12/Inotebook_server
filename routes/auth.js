const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = 'Dishaisanaughtygirl';
//create a User using POST "/api/auth/createuser". No login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password','password must be atleast 5 character').isLength({min:5}),

],async (req,res)=>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({error: error.array()});
    }
    //check whether the user exists already
    try{
   let user = await User.findOne({email:req.body.email});
   if(user){
    return res.status(200).json({error: "user with this email is already exists"});
   }
   const salt = await bcrypt.genSalt(10);
   const secPassword = await bcrypt.hash(req.body.password, salt);
   user = await User.create({
        name: req.body.name,
        password: secPassword,
        email: req.body.email,
    });
    const data ={
      user: {
        id: user.id,
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json(authtoken);

   } catch (error){
    console.log(error.message);
    res.status(500).send("Some error occurred")
   }
    
})

module.exports = router