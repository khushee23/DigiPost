import supabase from "../config/supabase.js"
export const getUsers=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("users")
        .select("*");

        if(error){
            throw error;
        }

        return res.status(200).json(data);
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
        .select("*")
        .eq("id",req.params.id)
        .single();

        if(error){
            if (error.code==="PGRST116"){
                return res.status(404).json({message:"User not found"});
            }
            throw error;
        }
        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching user by id:${error}`);
        return res.status(500).json({message:"Internal error in fetching user by id"});
    }
}
export const updateUserById=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("users")
        .update(req.body)
        .eq("id",req.params.id)
        .select("*")
        .single();

        if(error){
            if (error.code==="PGRST116"){
                return res.status(404).json({message:"User not found"});
            }
            throw error;
        }
        return res.status(200).json(data);
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
        .select("*")
        .single();
    
        if(error){
            if (error.code==="PGRST116"){
                return res.status(404).json({message:"User not found"});
            }
            throw error;
        }
        return res.status(200).json({message:"User deleted successfully"});
    }
    catch(error){
        console.log(`Error in deleting user:${error}`);
        return res.status(500).json({message:"Internal error in deleting user"});
    }
}