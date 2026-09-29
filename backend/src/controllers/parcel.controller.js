import supabase from "../config/supabase.js"
export const createParcel=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("parcels")
        .insert({...req.body,sender:req.params.senderId,receiver:req.params.receiverId})
        .select()
        .single();

        if(error){
            throw error;
        }
        return res.status(201).json(data);
    }
    catch(error){
        console.log(`Error in creating parcel:${error}`);
        return res.status(500).json({message:"Internal error in creating parcel"})
    }
}
export const getParcels=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("parcels")
        .select("*");

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching parcels:${error}`);
        return res.status(500).json({message:"Internal error in fetching parcels"});
    }
}
export const getParcelById=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("parcels")
        .select("*")
        .eq("id",req.params.id)
        .single();

        if(error){
            if (error.code==="PGRST116"){
                return res.status(404).json({message:"Parcel not found"});
            }
            throw error;
        }
        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching parcel by id:${error}`);
        return res.status(500).json({message:"Internal error in fetching parcel by id"});
    }
}
export const updateParcelById=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("parcels")
        .update(req.body)
        .eq("id",req.params.id)
        .select("*")
        .single();

        if(error){
            if (error.code==="PGRST116"){
                return res.status(404).json({message:"Parcel not found"});
            }
            throw error;
        }
        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in updating parcel:${error}`);
        return res.status(500).json({message:"Internal error in updating parcel"});
    }
}
export const deleteParcel=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("parcels")
        .delete()
        .eq("id",req.params.id)
        .select("*")
        .single();
    
        if(error){
            if (error.code==="PGRST116"){
                return res.status(404).json({message:"Parcel not found"});
            }
            throw error;
        }
        return res.status(200).json({message:"Parcel deleted successfully"});
    }
    catch(error){
        console.log(`Error in deleting parcel:${error}`);
        return res.status(500).json({message:"Internal error in deleting parcel"});
    }
}
export const getBookings=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("parcels")
        .select("*")
        .eq("sender",req.params.id)
        .or("status.eq.pending,status.eq.in_transit,status.eq.out_for_delivery");

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching bookings:${error}`);
        return res.status(500).json({message:"Internal error in fetching bookings"});
    }
}
export const getHistory=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("parcels")
        .select("*")
        .eq("sender",req.params.id)
        .eq("status","delivered");

        if(error){
            throw error;
        }

        return res.status(200).json(data);
    }
    catch(error){
        console.log(`Error in fetching bookings:${error}`);
        return res.status(500).json({message:"Internal error in fetching bookings"});
    }
}
