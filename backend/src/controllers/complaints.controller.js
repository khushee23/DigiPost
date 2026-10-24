import store from '../services/store.js';

const formatComplaint = (c) => {
  if (!c) return null;
  return {
    ...c,
    _id: c.id || c._id,
    trackingId: c.trackingId || c.tracking_id,
    customerId: c.customerId || c.customer,
    customerName: c.customerName || c.customer_name,
    customerEmail: c.customerEmail || c.customer_email,
    resolutionNotes: c.resolutionNotes || c.resolution_notes,
  };
};

// POST /complaints
export const createComplaint = async (req, res) => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required',
      });
    }

    const complaint = await store.addComplaint(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: formatComplaint(complaint),
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
    });
  }
};

// GET /complaints/my-complaints
export const getMyComplaints = async (req, res) => {
  try {
    let customerId = req.query.customerId || req.user?.id;
    // Security: Customer can only view their own complaints
    if (req.user?.role === 'customer') {
      customerId = req.user.id;
    }
    const complaints = store.getComplaints({ customerId }).map(formatComplaint);

    return res.status(200).json({
      success: true,
      complaints,
      total: complaints.length,
    });
  } catch (error) {
    console.error('Error fetching customer complaints:', error);
    return res.status(500).json({ success: false, message: 'Failed to load complaints' });
  }
};

// GET /complaints (Admin)
export const getComplaints = async (req, res) => {
  try {
    const complaints = store.getComplaints({
      status: req.query.status,
      search: req.query.search,
    }).map(formatComplaint);

    return res.status(200).json({
      success: true,
      complaints,
      total: complaints.length,
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return res.status(500).json({ success: false, message: 'Failed to load complaints' });
  }
};

// GET /complaints/:id
export const getComplaintById = async (req, res) => {
  try {
    const complaint = store.getComplaintById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    if (req.user?.role === 'customer' && complaint.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this complaint' });
    }

    return res.status(200).json({ success: true, complaint: formatComplaint(complaint) });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }
};

// PATCH /complaints/:id/status or PATCH /complaints/:id
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, resolution } = req.body;
    const updated = await store.updateComplaintStatus(req.params.id, {
      status,
      resolutionNotes: resolutionNotes || resolution,
      adminUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: formatComplaint(updated),
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error updating complaint' });
  }
};