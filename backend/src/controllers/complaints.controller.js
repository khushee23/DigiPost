
import supabase from "../config/supabase.js";
import { withClientId } from "../utils/serialize.js";
import { COMPLAINT_STATUSES } from "../utils/statuses.js";

// Create a complaint
export const createComplaint = async (req, res) => {
  try {
    const { parcel_id, trackingId, subject, description, category } = req.body;

    if ((!parcel_id && !trackingId) || !subject || !description) {
      return res.status(400).json({
        message: "A parcel (parcel_id or trackingId), subject and description are required",
      });
    }

    // Find the parcel by id, or by tracking id (the frontend sends trackingId)
    const parcelQuery = supabase.from("parcels").select("id, sender");
    const { data: parcel, error: parcelError } = await (parcel_id
      ? parcelQuery.eq("id", parcel_id)
      : parcelQuery.eq("tracking_id", trackingId)
    ).maybeSingle();

    if (parcelError) throw parcelError;
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // FIX: the customer is the logged-in user. The old code trusted customer_id from the
    // request body, so anyone could file complaints in someone else's name.
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(parcel.sender) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only complain about your own parcels" });
    }
    const customer = isAdmin && req.body.customer_id ? req.body.customer_id : req.user.id;

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        customer,
        parcel: parcel.id,
        subject,
        description,
        category: category || null,
        status: "OPEN",
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: "Complaint created successfully",
      data: withClientId(data),
    });
  } catch (error) {
    console.error("Error creating complaint:", error);

    return res.status(500).json({
      message: "Internal error while creating complaint",
    });
  }
};

// Get all complaints (admin)
export const getComplaints = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*");

    if (error) throw error;

    return res.status(200).json(data.map(withClientId));
  } catch (error) {
    console.error("Error fetching complaints:", error);

    return res.status(500).json({
      message: "Internal error while fetching complaints",
    });
  }
};

// Get a complaint by ID (admin, or the customer who filed it)
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

    if (req.user.role !== "admin" && String(data.customer) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(withClientId(data));
  } catch (error) {
    console.error("Error fetching complaint:", error);

    return res.status(500).json({
      message: "Internal error while fetching complaint",
    });
  }
};

const fetchComplaintsOf = async (customerId) => {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("customer", customerId);
  if (error) throw error;
  return data.map(withClientId);
};

// Get complaints belonging to a customer (route is guarded by selfOrAdmin)
export const getCustomerComplaints = async (req, res) => {
  try {
    return res.status(200).json(await fetchComplaintsOf(req.params.customerId));
  } catch (error) {
    console.error("Error fetching customer complaints:", error);

    return res.status(500).json({
      message: "Internal error while fetching customer complaints",
    });
  }
};

// Complaints of the logged-in customer (path used by the frontend contract)
export const getMyComplaints = async (req, res) => {
  try {
    return res.status(200).json(await fetchComplaintsOf(req.user.id));
  } catch (error) {
    console.error("Error fetching my complaints:", error);

    return res.status(500).json({
      message: "Internal error while fetching complaints",
    });
  }
};

// Update complaint status and resolution (admin)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // The API contract calls it resolutionNotes, the DB column is `resolution`: accept both
    const resolution = req.body.resolution ?? req.body.resolutionNotes;

    const updates = {};

    if (status !== undefined) {
      const normalized = String(status).toUpperCase();
      if (!COMPLAINT_STATUSES.includes(normalized)) {
        return res.status(400).json({
          message: `Status must be one of: ${COMPLAINT_STATUSES.join(", ")}`,
        });
      }
      updates.status = normalized;
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
      data: withClientId(data),
    });
  } catch (error) {
    console.error("Error updating complaint:", error);

    return res.status(500).json({
      message: "Internal error while updating complaint",
    });
  }
};
