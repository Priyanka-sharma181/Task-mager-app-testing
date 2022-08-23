const sgMail = require("@sendgrid/mail")
const sendGridApiKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(sendGridApiKey)

const sendEmail = (name,email) => {
        sgMail.send({
            to:email,
            from:'priyankasharma7694074441@gmail.com',
            subject:'This is for joining',
            text:  `welcome to the app ${name}, let me know how along with the app`
        })
}

const sendEmailCancaltion = (name,email)=>{
    sgMail.send({
        to:email,
        from:'priyankasharma7694074441@gmail.com',
        subject:'sorry to see you go!',
        text:  `Good by ${name}, I hope see you sometime`
    })
}

module.exports = {
    sendEmail,
    sendEmailCancaltion
}