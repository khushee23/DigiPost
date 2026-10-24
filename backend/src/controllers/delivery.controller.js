import supabase from "../config/supabase.js"
import { withClientId } from "../utils/serialize.js"
import { PARCEL_STATUSES, ACTIVE_STATUSES } from "../utils/statuses.js"

// Loads a delivery and checks the caller is an admin or the assigned employee.
// Returns the delivery, or sends the 404/403 response itself and returns null.
const loadAuthorizedDelivery = async (req, res, columns) => {
    const {data,error}=await supabase
        .from("deliveries")
        .select(`employee, ${columns}`)
        .eq("id",req.params.id)
        .maybeSingle();

    if(error){
        throw error;
    }
    if(!data){
        res.status(404).json({message:"Delivery not found"});
        return null;
    }
    if(req.user.role!=="admin" && String(data.employee)!==String(req.user.id)){
        res.status(403).json({message:"Access denied"});
        return null;
    }
    return data;
}

export const getDeliveries=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("deliveries")
        .select("*")
        .eq("employee",req.params.id);

        if(error){
            throw error;
        }

        return res.status(200).json(data.map(withClientId));
    }
    catch(error){
        console.log(`Error in fetching deliveries:${error}`);
        return res.status(500).json({message:"Internal error in fetching deliveries"});
    }
}
export const getDeliveriesToday=async(req,res)=>{
    try{
        // FIX: .eq("assigned_at", today) never matches a timestamp column.
        // Compare against the whole day instead. Optional ?date=YYYY-MM-DD (UTC day).
        const day = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || "")
            ? req.query.date
            : new Date().toISOString().split("T")[0];
        const start = `${day}T00:00:00.000Z`;
        const end = new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000).toISOString();

        const {data,error}=await supabase
        .from("deliveries")
        .select("*")
        .eq("employee",req.params.id)
        .gte("assigned_at",start)
        .lt("assigned_at",end);

        if(error){
            throw error;
        }

        return res.status(200).json(data.map(withClientId));
    }
    catch(error){
        console.log(`Error in fetching today's deliveries:${error}`);
        return res.status(500).json({message:"Internal error in fetching today's deliveries"});
    }
}
export const getDeliveryStatus=async(req,res)=>{
    try{
        const delivery = await loadAuthorizedDelivery(req,res,"status");
        if(!delivery) return;
        return res.status(200).json({status:delivery.status});
    }
    catch(error){
        console.log(`Error in fetching delivery status:${error}`);
        return res.status(500).json({message:"Internal error in fetching delivery status"});
    }
}
export const getDeliveryPriority=async(req,res)=>{
    try{
        const delivery = await loadAuthorizedDelivery(req,res,"priority");
        if(!delivery) return;
        return res.status(200).json({priority:delivery.priority});
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
        .eq("status",PARCEL_STATUSES.DELIVERED);

        if(error){
            throw error;
        }

        return res.status(200).json(data.map(withClientId));
    }
    catch(error){
        console.log(`Error in fetching employee history:${error}`);
        return res.status(500).json({message:"Internal error in fetching employee history"});
    }
}
export const getEmployeePerformance=async(req,res)=>{
    try{
        const{data,error}=await supabase
            .from("deliveries")
            .select("status")
            .eq("employee",req.params.id);

        if (error) {
            throw error;
        }

        // FIX: status names now match the rest of the app (the old code looked for
        // "in transit" / "out for delivery", which never matched "in_transit" etc.)
        const totalCancelled=data.filter(d=>d.status===PARCEL_STATUSES.CANCELLED).length;
        const totalAssigned=data.length-totalCancelled;
        const totalDelivered=data.filter(d=>d.status===PARCEL_STATUSES.DELIVERED).length;
        const totalFailed=data.filter(d=>d.status===PARCEL_STATUSES.FAILED).length;
        const pendingDeliveries=data.filter(d=>ACTIVE_STATUSES.includes(d.status)).length;
        const finished=totalDelivered+totalFailed;
        const successRate=finished===0?0:Math.round((totalDelivered/finished)*100);

        return res.status(200).json({
            employeeId:req.params.id,
            totalAssigned,
            totalDelivered,
            totalFailed,
            pendingDeliveries,
            successRate
        });

    }
    catch(error){
        console.log(`Error in fetching employee performance:${error}`);
        return res.status(500).json({message:"Internal error in fetching employee performance"});
    }
};
