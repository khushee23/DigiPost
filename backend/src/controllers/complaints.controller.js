
import supabase from "../config/supabase.js";

// Create a complaint
export const createComplaint = async (req, res) => {
  try {
    const {
      customer_id,
      parcel_id,
      subject,
      description,
    } = req.body;

    if (!customer_id || !parcel_id || !subject || !description) {
      return res.status(400).json({
        message: "Customer ID, parcel ID, subject and description are required",
      });
    }

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        customer: customer_id,
        parcel: parcel_id,
        subject,
        description,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Complaint created successfully",
      data,
    });
  } catch (error) {
    console.error("Error creating complaint:", error);

    return res.status(500).json({
      message: "Internal error while creating complaint",
    });
  }
};

// Get all complaints
export const getComplaints = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching complaints:", error);

    return res.status(500).json({
      message: "Internal error while fetching complaints",
    });
  }
};

// Get a complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching complaint:", error);

    return res.status(500).json({
      message: "Internal error while fetching complaint",
    });
  }
};

// Get complaints belonging to a customer
export const getCustomerComplaints = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("customer", req.params.customerId);

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching customer complaints:", error);

    return res.status(500).json({
      message: "Internal error while fetching customer complaints",
    });
  }
};

// Update complaint status and resolution
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const updates = {};

    if (status !== undefined) {
      updates.status = status;
    }

    if (resolution !== undefined) {
      updates.resolution = resolution;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide a status or resolution to update",
      });
    }

    const { data, error } = await supabase
      .from("complaints")
      .update(updates)
      .eq("id", req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      message: "Complaint updated successfully",
      data,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);

    return res.status(500).json({
      message: "Internal error while updating complaint",
    });
  }
};