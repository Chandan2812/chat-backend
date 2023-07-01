const express = require("express")
const {UserModel} = require("../model/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors");
const nodemailer= require("nodemailer")


const userRouter = express.Router()
userRouter.use(cors());

const JWT_SECRET = "chat";






userRouter.post("/register", async (req, res) => {
  const { fname, email, password } = req.body;
  

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    const userdata = await UserModel.create({
      fname,
      email,
      password: encryptedPassword,
    });
    const id=(userdata._id).toString()
    // console.log(userdata.fname,userdata.email,id)
    sendVerifyMail(userdata.fname,userdata.email,id)
    res.send({ status: "User Register Successfully" });
  } catch (error) {
    res.send({ status: "something went wrong", err: error.message });
  }
});



userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    // console.log(user)
    if(!user.isverified)
    {
      return res.json({message:"Mail is not verified"})
    }
    if (!user) {
      return res.json({ message: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });

      // if (res.status(201)) {
      return res.json({ status: "ok", data: token, userID: user._id, userDetails: user });
      // } else {
      // return res.json({ error: "error" });
      // }
    } else {
      return res.json({ status: false, message: "Invalid Password" });

    }
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});


const sendVerifyMail=async(fname,email,id)=>{
  try {
    const transporter = nodemailer.createTransport({
      host:"smtp.gmail.com",
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:"chandanpms@gmail.com",
        pass:"ygcxogdczabtvpdi"
      }
    })
    const mailOptions ={
      from:"chandanpms@gmail.com",
      to:email,
      subject:"For verification mail",
      html:`<p> Hii ${fname}, please click here to <a href="http://localhost://8000/users/verify/${id}">verify</a> your mail. </p>`
    }
    transporter.sendMail(mailOptions,function(error,info){
      if(error)
      {
        console.log(error)
      }
      else{
        console.log("Email has been send",info.response)
      }
    })
  } catch (error) {
    console.log(error.message)
  }
}


userRouter.patch("/verify/:id",async(req, res)=>{
  try {
    console.log(req.params.id)
    const updateInfo = await UserModel.updateOne({_id:req.params.id},{$set:{isverified:true}})
    console.log("mail has been verified")
    res.send({msg:"mail has been verified"})

  } catch (error) {
    console.log(error.message)
  }
})

module.exports={userRouter}