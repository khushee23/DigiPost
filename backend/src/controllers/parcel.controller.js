import supabase from "../config/supabase.js"
import { withClientId } from "../utils/serialize.js"
import { PARCEL_STATUSES, ACTIVE_STATUSES } from "../utils/statuses.js"

// Fields a client is never allowed to set when creating/editing a parcel
const PROTECTED_FIELDS = ["id", "sender", "status", "employee", "created_at", "updated_at"]

const omit = (body, fields) => {
    const copy = { ...body }
    fields.forEach((f) => delete copy[f])
    return copy
}

const loadParcel = async (id) => {
    const {data,error}=await supabase.from("parcels").select("*").eq("id",id).maybeSingle()
    if(error) throw error
    return data
}

const isOwner = (user, parcel) => String(parcel.sender) === String(user.id)

export const createParcel=async(req,res)=>{
    try{
        if(req.user.role==="employee"){
            return res.status(403).json({message:"Employees cannot book parcels"})
        }

        // FIX: the old code read req.params.senderId / receiverId, which do not exist on
        // POST /parcels, so sender and receiver were saved as undefined.
        // The sender is now the logged-in user. `receiver` (if your table has it) comes from the body.
        const sender = req.user.role==="admin" && req.body.sender ? req.body.sender : req.user.id
        const {data,error}=await supabase
        .from("parcels")
        .insert({...omit(req.body, PROTECTED_FIELDS), sender, status: PARCEL_STATUSES.PENDING})
        .select()
        .single();

        if(error){
            throw error;
        }
        return res.status(201).json(withClientId(data));
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

        return res.status(200).json(data.map(withClientId));
    }
    catch(error){
        console.log(`Error in fetching parcels:${error}`);
        return res.status(500).json({message:"Internal error in fetching parcels"});
    }
}
export const getParcelById=async(req,res)=>{
    try{
        const parcel = await loadParcel(req.params.id)
        if(!parcel){
            return res.status(404).json({message:"Parcel not found"});
        }
        if(req.user.role!=="admin" && !isOwner(req.user, parcel)){
            return res.status(403).json({message:"Access denied"});
        }
        return res.status(200).json(withClientId(parcel));
    }
    catch(error){
        console.log(`Error in fetching parcel by id:${error}`);
        return res.status(500).json({message:"Internal error in fetching parcel by id"});
    }
}
export const updateParcelById=async(req,res)=>{
    try{
        const parcel = await loadParcel(req.params.id)
        if(!parcel){
            return res.status(404).json({message:"Parcel not found"});
        }

        let updates
        if(req.user.role==="admin"){
            updates = omit(req.body, ["id", "created_at"])
        } else if(isOwner(req.user, parcel)){
            // Customers may only edit their own parcel while it is still pending,
            // and can never change status, sender or the assigned employee.
            if(parcel.status!==PARCEL_STATUSES.PENDING){
                return res.status(403).json({message:"Only pending parcels can be edited"});
            }
            updates = omit(req.body, PROTECTED_FIELDS)
        } else {
            return res.status(403).json({message:"Access denied"});
        }

        if(Object.keys(updates).length===0){
            return res.status(400).json({message:"No valid fields to update"});
        }

        const {data,error}=await supabase
        .from("parcels")
        .update(updates)
        .eq("id",req.params.id)
        .select("*")
        .maybeSingle();

        if(error){
            throw error;
        }
        return res.status(200).json(withClientId(data));
    }
    catch(error){
        console.log(`Error in updating parcel:${error}`);
        return res.status(500).json({message:"Internal error in updating parcel"});
    }
}
export const deleteParcel=async(req,res)=>{
    try{
        const parcel = await loadParcel(req.params.id)
        if(!parcel){
            return res.status(404).json({message:"Parcel not found"});
        }
        const ownerMayDelete = isOwner(req.user, parcel) && parcel.status===PARCEL_STATUSES.PENDING
        if(req.user.role!=="admin" && !ownerMayDelete){
            return res.status(403).json({message:"Access denied"});
        }

        const {error}=await supabase
        .from("parcels")
        .delete()
        .eq("id",req.params.id);

        if(error){
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
        // FIX: "assigned" was missing from the old status list
        const {data,error}=await supabase
        .from("parcels")
        .select("*")
        .eq("sender",req.params.id)
        .in("status",ACTIVE_STATUSES);

        if(error){
            throw error;
        }

        return res.status(200).json(data.map(withClientId));
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
        .eq("status",PARCEL_STATUSES.DELIVERED);

        if(error){
            throw error;
        }

        return res.status(200).json(data.map(withClientId));
    }
    catch(error){
        console.log(`Error in fetching history:${error}`);
        return res.status(500).json({message:"Internal error in fetching history"});
    }
}
