import supabase from "../config/supabase.js";

//get notifications 
export const getNotifications=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("notifications")
        .select("*")
        .eq("customer",req.params.id)
        .order("created_at", {ascending:false});

        if(error){
            throw error;
        }
        return res.status(200).json(data);
    }catch(error){
        console.error("Error fetching notifications:", error);

        return res.status(500).json({
            message: "Internal error while fetching notifications",
        });
    }
};

export const getUnreadCount=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("notifications")
        .select("id")
        .eq("customer",req.params.id)
        .eq("is_read",false);

        if(error){
            throw error;
        }
        return res.status(200).json({unreadCount:data.length});

    }catch(error){
        console.error("Error fetching unread count:", error);
        return res.status(500).json({
            message: "Internal error while fetching unread count",
        });
    }
};

export const markAsRead=async(req,res)=>{
    try {
        const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("customer", req.params.id)
        .eq("id", req.params.notificationId)
        .select();

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            data: data[0],
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({
        message: "Internal error while marking notification as read",
    });
  }
};

export const markAllAsRead=async(req,res)=>{
    try{
        const {data,error}=await supabase
        .from("notifications")
        .update({is_read:true})
        .eq("customer", req.params.id)
        .eq("is_read", false)
        .select("id");

        if(error){
            throw error;
        }
        
        return res.status(200).json({
            message: "All notifications marked as read",
            updatedCount: data.length,
        });
    }catch(error){
        console.error("Error marking all notifications as read:", error);
        return res.status(500).json({
            message: "Internal error while making all notifications as read",
        });
    }
};
