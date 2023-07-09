const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchUser = require('../middleware/fetchUser');

const JWT_SECRET = 'Dishaisanaughty$girl';

// ROUTE:1 create a User using POST "/api/auth/createuser". No login required
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

// ROUTE:2 Authenticate a User using POST "/api/auth/login".login required

router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','password can not be blank').exists(),

],async (req,res)=>{
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({error: error.array()});
  }
  const {email, password} = req.body;

  try {
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({error: "try to login with correct credentials "});
     }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
        return res.status(400).json({error: "try to login with correct credentials "});
     }


     const data ={
      user: {  
        id: user.id,
      }};

      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json(authtoken);
  
     } catch (error){
      console.log(error.message);
      res.status(500).send("Some error occurred")
     }


});

// ROUTE:3 LoggedIn User details using POST "/api/auth/getuser".login required
router.post('/getuser', fetchUser, async (req,res)=>{

try {
  userId = req.user.id;
  const user = await User.findById(userId).select("-password");
  res.send(user);

} catch (error) {
  console.log(error.message);
      res.status(500).send("Some error occurred")
}
});
module.exports = router