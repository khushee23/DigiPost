import supabase from "../config/supabase.js"
export const getDeliveries=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("deliveries")
        .select("*")
        .eq("employee",req.params.id);

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching deliveries:${error}`);
        return res.status(500).json({message:"Internal error in fetching deliveries"});
    }
}
export const getDeliveriesToday=async(req,res)=>{
    try{
        const today = new Date().toISOString().split("T")[0];
        const {data,error}=await supabase
        .from("deliveries")
        .select("*")
        .eq("employee",req.params.id)
        .eq("assigned_at",today);

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching today's deliveries:${error}`);
        return res.status(500).json({message:"Internal error in fetching today's deliveries"});
    }
}
export const getDeliveryStatus=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("deliveries")
        .select("status")
        .eq("id",req.params.id)
        .single();

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching delivery status:${error}`);
        return res.status(500).json({message:"Internal error in fetching delivery status"});
    }
}
export const getDeliveryPriority=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("deliveries")
        .select("priority")
        .eq("id",req.params.id)
        .single();

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching delivery priority:${error}`);
        return res.status(500).json({message:"Internal error in fetching delivery priority"});
    }
}
export const getEmployeeHistory=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("deliveries")
        .select("*")
        .eq("employee",req.params.id)
        .eq("status","delivered");

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching employee history:${error}`);
        return res.status(500).json({message:"Internal error in fetching employee history"});
    }
}