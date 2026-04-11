import express from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { validateUserInput } from "../utils/validate";
const authRouter = express.Router();
authRouter.post("/login",async(req,res)=>{
   try {
     const { userName, password } = req.body;
     const user = await User.findOne({ userName });
     if (!user) {
       return res.status(400).json({ message: "Invalid username or password" });
     }
     const isMatch = await user.comparePassword(password);
     if (!isMatch) {
       return res.status(400).json({ message: "Invalid username or password" });
     }
     const token = await user.generateToken();
     res.cookie("token", token, {
       expires: new Date(Date.now() + 8 * 3600000),
       httpOnly: true
     });
     const { password: _, ...safeUser } = user.toObject()
     res.json({ data: safeUser, message: "Login successful" });
   } catch (err) {
     res.status(500).json({ message: "Server error" + err });
   }
})
authRouter.post("/signUp",async(req,res)=>{
    
    try{
        validateUserInput(req.body);
      const { userName, email, password } = req.body;
      const existingUser = await User.findOne({
        $or: [{ userName }, { email }],
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Username or email already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({ userName, email, password: passwordHash });
      await newUser.save();
      const token = await newUser.generateToken();
     res.cookie("token", token, {
       expires: new Date(Date.now() + 8 * 3600000),
       httpOnly: true
     });
     const { password: _, ...safeUser } = newUser.toObject()
      res.json({ data: safeUser, message: "User created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" + err });
    }
})
authRouter.post('/logout',(req,res)=>{
    res.clearCookie("token", { httpOnly: true })
    res.json({ message: 'Logged out successfully' })
})
export default authRouter;