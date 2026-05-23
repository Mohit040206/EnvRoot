require('dotenv').config();

const jwt=require("jsonwebtoken")

exports.authenticate=(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message:"No token provided"})
        }
        const token=authHeader.split("Bearer ")[1]
        const decodeData=jwt.verify(token,process.env.JWT_KEY)
        req.user=decodeData;
        next();
    }catch(err){
        return res.status(401).json({message:"Inavlid or expired token"})
    }
}

exports.authorize=(role=[])=>{
    return (req,res,next)=>{
        if(!role.includes(req.user.role)){
            return res.status(403).json({message:"Access denied"})
        }
        next()
    }
}