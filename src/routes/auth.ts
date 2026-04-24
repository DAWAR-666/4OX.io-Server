import express from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import { validateUserInput } from "../utils/validate";
const authRouter = express.Router();
const safeUserFunc=(user:IUser)=>{
  return {
    userName:user.userName,
    email:user.email,
    stats: {
        wins: user.stats?.wins ?? 0,
        losses: user.stats?.losses ?? 0,
        totalGames: user.stats?.totalGames ?? 0,
        winRate: user.stats?.winRate ?? 0,
    },
    _id:user._id.toString()
  }
}
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
     const token = user.generateToken();
     res.cookie("token", token, {
       expires: new Date(Date.now() + 8 * 3600000),
       httpOnly: true,
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',  // ← 'none' for cross-domain
      secure: process.env.NODE_ENV === 'production' ? true : false 
     });
     const safeUser=safeUserFunc(user)
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
      const token = newUser.generateToken();
     res.cookie("token", token, {
       expires: new Date(Date.now() + 8 * 3600000),
       httpOnly: true,
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',  // ← 'none' for cross-domain
  secure: process.env.NODE_ENV === 'production' ? true : false 
     });
     const safeUser=safeUserFunc(newUser)
      res.json({ data: safeUser, message: "User created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" + err });
    }
})
authRouter.post('/logout',(req,res)=>{
    res.clearCookie("token", {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  secure: process.env.NODE_ENV === 'production' ? true : false
})
    res.json({ message: 'Logged out successfully' })
})
export default authRouter;