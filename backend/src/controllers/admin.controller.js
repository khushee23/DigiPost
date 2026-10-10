
import supabase from "../config/supabase.js";

// Get admin details
export const getAdmin = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("admin")
      .select("id, name, email")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching admin:", error);

    return res.status(500).json({
      message: "Internal error while fetching admin",
    });
  }
};

// Update admin details
export const updateAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide name or email to update",
      });
    }

    const { data, error } = await supabase
      .from("admin")
      .update(updates)
      .eq("id", req.params.id)
      .select("id, name, email")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      message: "Admin details updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error updating admin:", error);

    return res.status(500).json({
      message: "Internal error while updating admin",
    });
  }
};