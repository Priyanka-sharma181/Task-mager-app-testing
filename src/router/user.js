const express = require("express")
const router =  express.Router()
const User = require("../model/user")
const auth  = require("../middle/auth")
const multer = require("multer")
const sharp = require("sharp")
const { sendEmailCancaltion, sendEmail } = require("../email/account")


router.post("/user",async (req,res)=>{
    const user = new User(req.body)
 try {
     await user.save()
     const token = await user.generateAuthToken()
     sendEmail(user.name,user.email)
     res.status(201).send({ user, token })

 } catch (error) {
    console.log(error);
     res.status(400).send(error)
 }
})

router.post("/user/login", async(req,res)=>{
    try {
    const user = await  User.findByCredentials(req.body.email,req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user , token })

    } catch (e) {   
        res.status(400).send(e)
    }
})

router.post("/user/logout",auth,async (req,res)=>{
try {
    req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
    })
    await req.user.save()

    res.send()
} catch (error) {
    res.send(error)
}
})


router.get("/users/me",auth,async(req,res)=>{
 try {
       res.send(req.user)   
   } catch (e) {
     res.status(400).send(e)
 }
})


router.patch("/user/me/:id",auth,async(req,res)=>{

 const id = req.user._id
 const updates = Object.keys(req.body)
 const allowedUpdates = ['name', 'email', 'password', 'age']
 const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

 if (!isValidOperation) {
     return res.status(400).send({ error: 'Invalid updates!' })
 }
 try {
   const  user = await User.findByIdAndUpdate(id,req.body,{new:true,runValidators:true})
   if(!user){
     res.status(404).send()
   }
   res.send(user)
 } catch (e) {
    console.log(e);
     res.status(400).send(e)
 }
})

router.delete("/users/me",auth,async (req,res)=>{
   try {
     await req.user.remove()
     sendEmailCancaltion(user.name,user.email)
     res.send(req.user)
   } catch (error) {
    res.status(500).send(error)
   }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send(req.user)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete("/users/delete",auth,async(req,res)=>{
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(401).send(error)
        console.log(error);
    }
})

router.get("/users/avatar/:id",async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router