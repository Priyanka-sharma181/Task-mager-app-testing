const express = require("express")
const router = express.Router()
const Task = require("../model/task")   
const auth = require("../middle/auth")

router.post("/task",auth,async(req,res)=>{
    const task = new Task(req.body)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get("/tasks",auth,async(req,res)=>{
    try{
    await req.user.populate("tasks").exec((err, user) => {
        res.send(req.user)
    })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get("/Tasks/:id",auth,async(req,res)=>{
    const _id = req.params.id
    try {
      taskFindById =  await Task.findOne({_id,owener:req.user._id})
        res.status(200).send(taskFindById)

    } catch (error) {
        res.status(400).send(error)

    }
   
})

router.patch("/updateTask/:id",async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description","completed"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(200).send(task)
      } catch (error) {
          res.status(400).send(error)
      }

})

router.delete("/task/:id",async (req,res)=>{
    try {
      const task =await  Task.findOneAndDelete({_id:req.params.id,owner:req.user.id})
      if(!task){
         res.send(200).send()
      }
      res.send(task)
    } catch (error) {
     res.status(400).send(error)
    }
 })
module.exports = router



