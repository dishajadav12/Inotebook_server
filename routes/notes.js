const express = require('express');
const router = express.Router();
var fetchUser = require('../middleware/fetchUser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');



// ROUTE:1 Get all notes using GET  "/api/auth/fetchallnotes". No login required

    router.get('/fetchallnotes', fetchUser, async (req,res)=>{
        try {
            const notes = await Note.find({user: req.user.id});
            res.json(notes);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Some error occurred")
        }

    })

 
// ROUTE:2 Add a new Note using : POST  "/api/auth/addnote". No login required
    router.post('/addnote', fetchUser,[
        body('title','Enter a valid title').isLength({min:3}),
        body('description','password must be atleast 5 character').isLength({min:5}),

    ], async (req,res)=>{
        try {
            const{title,description,tag} = req.body;
            //If there are errors, return Bad request and the errors
            const error = validationResult(req);
            if (!error.isEmpty()) {
                return res.status(400).json({error: error.array()});
            }
    
            const note = new Note ({
                    title, description, tag, user: req.user.id
            })
            const saveNote = await note.save();
           res.json(saveNote);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Some error occurred")
        }


})
// ROUTE:3 Update an existing note: PUT  "/api/auth/updatenote". No login required
router.put('/updatenote/:id', fetchUser, async (req,res)=>{
    try {
        const{title,description,tag} = req.body;
        //create a newNote object
        const Newnote = {};
        if(title) {Newnote.title = title};
        if(description) {Newnote.description = description};    
        if(tag) {Newnote.tag = tag};

        //Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("Not found");}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id, {$set: Newnote},{new:true});
        res.json({note});

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occurred")
    }


})
// ROUTE:4 Delete note: DELETE  "/api/auth/delete". No login required
router.delete('/deletenote/:id', fetchUser, async (req,res)=>{
    try {
         //Find the note to be delete and delete it
         let note = await Note.findById(req.params.id);
         if(!note){return res.status(404).send("Not found");}
        
         //Allow deletion if user owns this note
         if(note.user.toString() !== req.user.id){
             return res.status(401).send("Not allowed");
         }

         note = await Note.findByIdAndDelete(req.params.id);
         res.json({"Success": "Note has been deleted ",note:note});

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occurred")
    }


})
module.exports = router