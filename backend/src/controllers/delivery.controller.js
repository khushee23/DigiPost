import store from '../services/store.js';

const formatDelivery = (d) => {
  if (!d) return null;
  return {
    ...d,
    _id: d.id || d._id,
    assignedEmployeeId: d.assignedEmployeeId || d.employee || d.employee_id,
    trackingId: d.parcel?.trackingId || d.tracking_id || d.trackingId,
  };
};

// GET /deliveries/my-deliveries
export const getMyDeliveries = async (req, res) => {
  try {
    let employeeId = req.query.employeeId || req.user?.id;
    // Security: Couriers can only view their own assigned deliveries
    if (req.user?.role === 'employee') {
      employeeId = req.user.id;
    }
    const deliveries = store.getDeliveries({
      employeeId,
      status: req.query.status,
      search: req.query.search,
    }).map(formatDelivery);

    return res.status(200).json({
      success: true,
      deliveries,
      total: deliveries.length,
    });
  } catch (error) {
    console.error('Error fetching employee deliveries:', error);
    return res.status(500).json({ success: false, message: 'Failed to load deliveries' });
  }
};

// GET /deliveries/today
export const getDeliveriesToday = async (req, res) => {
  try {
    const employeeId = req.user?.role === 'employee' ? req.user.id : (req.query.employeeId || null);
    const deliveries = store.getDeliveriesToday(employeeId).map(formatDelivery);

    return res.status(200).json({
      success: true,
      deliveries,
      total: deliveries.length,
    });
  } catch (error) {
    console.error('Error fetching today deliveries:', error);
    return res.status(500).json({ success: false, message: 'Failed to load today’s deliveries' });
  }
};

// GET /deliveries (Admin Delivery Monitoring)
export const getDeliveries = async (req, res) => {
  try {
    const deliveries = store.getDeliveries({
      status: req.query.status,
      search: req.query.search,
    }).map(formatDelivery);

    return res.status(200).json({
      success: true,
      deliveries,
      total: deliveries.length,
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return res.status(500).json({ success: false, message: 'Failed to load deliveries' });
  }
};

// GET /deliveries/:id
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = store.getDeliveryById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found' });
    }
    if (
      req.user?.role === 'employee' &&
      (delivery.assignedEmployeeId || delivery.employee) !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this delivery' });
    }

    return res.status(200).json({ success: true, delivery: formatDelivery(delivery) });
  } catch (error) {
    console.error('Error fetching delivery:', error);
    return res.status(500).json({ success: false, message: 'Failed to load delivery' });
  }
};

// PATCH /deliveries/:id/status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = store.getDeliveryById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found' });
    }

    // Security check: Employee can only update deliveries assigned to them
    if (req.user?.role === 'employee') {
      const assignedId = delivery.assignedEmployeeId || delivery.employee;
      const userEmail = req.user.email?.toLowerCase();
      const isAssigned =
        assignedId === req.user.id ||
        (delivery.assignedEmployee?.email?.toLowerCase() === userEmail);

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to update deliveries assigned to another employee.',
        });
      }
    }

    const { status, location, note, failureReason, employeeName } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = await store.updateDeliveryStatus(req.params.id, {
      status,
      location,
      note,
      failureReason,
      employeeName: employeeName || req.user?.name,
    });

    return res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status} successfully`,
      delivery: formatDelivery(updated),
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return res.status(400).json({ success: false, message: error.message || 'Error updating delivery status' });
  }
};

// PATCH /deliveries/:id/reassign
export const reassignDelivery = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required for reassignment' });
    }

    const updated = await store.reassignDelivery(req.params.id, employeeId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Delivery reassigned successfully',
      delivery: formatDelivery(updated),
    });
  } catch (error) {
    console.error('Error reassigning delivery:', error);
    return res.status(400).json({ success: false, message: error.message || 'Error reassigning delivery' });
  }
};

// POST /deliveries/:id/assign
export const assignDelivery = async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required for assignment' });
    }

    const delivery = store.getDeliveryById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found' });
    }

    const updated = await store.reassignDelivery(req.params.id, employeeId, req.user);
    return res.status(200).json({
      success: true,
      message: 'Delivery assigned successfully',
      delivery: formatDelivery(updated),
    });
  } catch (error) {
    console.error('Error assigning delivery:', error);
    return res.status(400).json({ success: false, message: error.message || 'Error assigning delivery' });
  }
};
