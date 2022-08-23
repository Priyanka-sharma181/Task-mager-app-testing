const mongoose = require('mongoose')
const validator =  require("validator")
const bcrypt = require("bcrypt")
const jwt  = require("jsonwebtoken")
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age:{
        type:Number,
        validate(value){
            if(value<0){
                throw new Error("age must be a possitive")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar:{
        type:Buffer
    
    },
}, {
    timestamps: true    
})

//  hash the paln text password
UserSchema.pre('save', async function(next){
    user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// Log in 

UserSchema.statics.findByCredentials = async (email,password)=>{
    console.log(email,password);
    const user = await User.findOne({email})
    console.log(user);
    if(!user){
        throw new Error("unable to log in")
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error("unable to log in")       
    }
    return user
}

// authentication 
UserSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET,{expiresIn:"6h"})
//    console.log(token);
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}
//  for stringfy 
UserSchema.methods.toJSON = function(){
    user = this
    userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

UserSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

UserSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model("User",UserSchema)
module.exports = User




