import supabase from "../config/supabase.js"
import { withClientId } from "../utils/serialize.js"

// Never select("*") on users: it would also return the password hash.
const USER_COLUMNS = "id, name, email, phone, address, role, status, station, created_at"

// Fields an admin may change through PATCH /users/:id (passwords go through /auth/change-password)
const UPDATABLE_FIELDS = ["name", "email", "phone", "address", "role", "status", "station"]

export const getUsers=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("users")
        .select(USER_COLUMNS);

        if(error){
            throw error;
        }

        return res.status(200).json(data.map(withClientId));
    }
    catch(error){
        console.log(`Error in fetching user:${error}`);
        return res.status(500).json({message:"Internal error in fetching user"});
    }
}
export const getUserById=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("users")
        .select(USER_COLUMNS)
        .eq("id",req.params.id)
        .maybeSingle();

        if(error){
            throw error;
        }
        if(!data){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json(withClientId(data));
    }
    catch(error){
        console.log(`Error in fetching user by id:${error}`);
        return res.status(500).json({message:"Internal error in fetching user by id"});
    }
}
export const updateUserById=async(req,res)=>{
    try{
        const updates = {};
        for (const field of UPDATABLE_FIELDS) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({message:"No valid fields to update"});
        }

        const {data,error}=await supabase
        .from("users")
        .update(updates)
        .eq("id",req.params.id)
        .select(USER_COLUMNS)
        .maybeSingle();

        if(error){
            throw error;
        }
        if(!data){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json(withClientId(data));
    }
    catch(error){
        console.log(`Error in updating user:${error}`);
        return res.status(500).json({message:"Internal error in updating user"});
    }
}
export const deleteUser=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("users")
        .delete()
        .eq("id",req.params.id)
        .select("id")
        .maybeSingle();

        if(error){
            throw error;
        }
        if(!data){
            return res.status(404).json({message:"User not found"});
        }
        return res.status(200).json({message:"User deleted successfully"});
    }
    catch(error){
        console.log(`Error in deleting user:${error}`);
        return res.status(500).json({message:"Internal error in deleting user"});
    }
}
