import jwt from "jsonwebtoken"

export const protectRoute=(req,res,next) => {
    try{
        const token=req.cookies.jwt
        if (!token) {
            return res.status(401).json({message:"Unauthorized-No token provided"})
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next()
    } 
    catch(error){
        console.log(`Error in protect route middleware:${error.message}`)
        return res.status(500).json({message: "Internal server error"})
    }
}

export const adminOnly = (req, res, next) => {
    try{
        if (req.user.role!=="admin") {
            return res.status(403).json({message:"Access denied"})
        }
        next()
    }
    catch(error){
        console.log(`Error in admin only middleware:${error.message}`)
        return res.status(500).json({message: "Internal server error"})
    }
};
