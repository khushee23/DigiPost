import store from '../services/store.js';
import supabase, { isSupabaseEnabled } from '../config/supabase.js';

const formatParcel = (p) => {
  if (!p) return null;
  return {
    ...p,
    _id: p.id || p._id,
    trackingId: p.trackingId || p.tracking_id || p.id,
    customerId: p.customerId || p.senderId || p.customer_id || p.sender,
  };
};

// POST /parcels
export const createParcel = async (req, res) => {
  try {
    const newParcel = await store.bookParcel(req.body, req.user);
    return res.status(201).json({
      success: true,
      trackingId: newParcel.trackingId,
      parcel: formatParcel(newParcel),
    });
  } catch (error) {
    console.error('Error creating parcel:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal error in creating parcel' });
  }
};

// GET /parcels/my-parcels
export const getMyParcels = async (req, res) => {
  try {
    let customerId = req.query.customerId || req.user?.id;
    // Security: If user is customer, enforce that they only access their own records
    if (req.user?.role === 'customer') {
      customerId = req.user.id;
    }
    const parcels = store.getParcels({
      customerId,
      status: req.query.status,
      search: req.query.search,
    }).map(formatParcel);

    return res.status(200).json({
      success: true,
      parcels,
      total: parcels.length,
    });
  } catch (error) {
    console.error('Error in getMyParcels:', error);
    return res.status(500).json({ success: false, message: 'Failed to load your parcels' });
  }
};

// GET /parcels (Admin)
export const getParcels = async (req, res) => {
  try {
    const isUnassignedOnly = req.query.unassignedOnly === 'true' || req.query.unassignedOnly === true;
    const parcels = store.getParcels({
      status: req.query.status,
      unassignedOnly: isUnassignedOnly,
      search: req.query.search,
    }).map(formatParcel);

    return res.status(200).json({
      success: true,
      parcels,
      total: parcels.length,
    });
  } catch (error) {
    console.error('Error in getParcels:', error);
    return res.status(500).json({ success: false, message: 'Failed to load parcels' });
  }
};

// GET /parcels/:identifier (by ID or tracking ID)
export const getParcelById = async (req, res) => {
  try {
    const parcel = store.getParcelById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    const parcelOwnerId = parcel.customerId || parcel.senderId;
    if (req.user?.role === 'customer' && parcelOwnerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this parcel' });
    }

    return res.status(200).json({ success: true, parcel: formatParcel(parcel) });
  } catch (error) {
    console.error('Error fetching parcel:', error);
    return res.status(500).json({ success: false, message: 'Failed to load parcel' });
  }
};

// GET /tracking/:trackingId (Public tracking)
export const getTracking = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const p = store.getParcelById(trackingId);

    if (!p) {
      return res.status(404).json({
        success: false,
        message: `No parcel record found matching tracking number '${trackingId}'.`,
      });
    }

    const tracking = {
      trackingId: p.trackingId || p.tracking_id,
      originCity: p.origin || (p.sender?.city ? `${p.sender.city}, ${p.sender.state}` : 'Origin Branch'),
      destinationCity: p.destination || (p.receiver?.city ? `${p.receiver.city}, ${p.receiver.state}` : 'Destination Hub'),
      parcelType: p.parcelType || 'standard',
      weight: p.weight || 1,
      status: p.status || 'PENDING',
      bookingDate: p.bookingDate || p.booking_date,
      expectedDeliveryDate: p.expectedDeliveryDate || p.expected_delivery_date,
      deliveredDate: p.deliveredDate || p.delivered_date || null,
      failureReason: p.failureReason || p.failure_reason || null,
      history: Array.isArray(p.history) && p.history.length > 0
        ? p.history.map((h) => ({
            status: h.status,
            timestamp: h.timestamp,
            location: h.location,
            note: h.note,
          }))
        : [
            {
              status: p.status || 'PENDING',
              timestamp: p.bookingDate || new Date().toISOString(),
              location: p.origin || 'Origin Facility',
              note: 'Consignment manifest recorded in system.',
            },
          ],
    };

    return res.status(200).json({ success: true, tracking });
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    return res.status(500).json({ success: false, message: 'Failed to load tracking details' });
  }
};

// POST /parcels/:parcelId/assign
export const assignParcel = async (req, res) => {
  try {
    const parcelId = req.params.parcelId;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required for assignment' });
    }

    const updatedParcel = await store.assignParcel(parcelId, employeeId);

    return res.status(200).json({
      success: true,
      message: 'Parcel assigned successfully and delivery dispatch created',
      parcel: formatParcel(updatedParcel),
    });
  } catch (error) {
    console.error('Error assigning parcel:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error assigning parcel' });
  }
};

// PATCH /parcels/:id/cancel
export const cancelParcel = async (req, res) => {
  try {
    const parcel = store.getParcelById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    // Ownership check: Customer can only cancel their own parcel
    const isOwner =
      parcel.customerId === req.user?.id ||
      parcel.senderId === req.user?.id ||
      parcel.sender === req.user?.id ||
      parcel.sender?.email?.toLowerCase() === req.user?.email?.toLowerCase();

    if (req.user?.role === 'customer' && !isOwner) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this parcel' });
    }

    if (parcel.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Parcel cannot be cancelled because it is already ${parcel.status}. Cancellation is only permitted while PENDING.`,
      });
    }

    const cancelled = await store.cancelParcel(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Parcel booking cancelled successfully',
      parcel: formatParcel(cancelled),
    });
  } catch (error) {
    console.error('Error cancelling parcel:', error);
    return res.status(400).json({ success: false, message: error.message || 'Error cancelling parcel' });
  }
};

// PATCH /parcels/:id
export const updateParcelById = async (req, res) => {
  try {
    const parcel = store.getParcelById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    const { description, receiver, origin, destination, parcelType, weight } = req.body;
    const updates = {};
    if (description !== undefined) updates.description = description;
    if (receiver !== undefined) updates.receiver = receiver;
    if (origin !== undefined) updates.origin = origin;
    if (destination !== undefined) updates.destination = destination;
    if (parcelType !== undefined) updates.parcelType = updates.parcel_type = parcelType;
    if (weight !== undefined) updates.weight = Number(weight);

    if (isSupabaseEnabled) {
      const databaseUpdates = {
        description: updates.description,
        receiver: updates.receiver,
        origin: updates.origin,
        destination: updates.destination,
        parcel_type: updates.parcel_type,
        weight: updates.weight,
        updated_at: new Date().toISOString(),
      };
      Object.keys(databaseUpdates).forEach((key) => {
        if (databaseUpdates[key] === undefined) delete databaseUpdates[key];
      });
      const { data, error } = await supabase
        .from('parcels')
        .update(databaseUpdates)
        .eq('tracking_id', parcel.trackingId)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'Parcel not found in database' });
    }
    Object.assign(parcel, updates);
    store.saveState();
    return res.status(200).json({ success: true, parcel: formatParcel(parcel) });
  } catch (error) {
    console.error('Error updating parcel:', error);
    return res.status(500).json({ success: false, message: 'Failed to update parcel' });
  }
};

// DELETE /parcels/:id
export const deleteParcel = async (req, res) => {
  try {
    const parcel = store.getParcelById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }
    if (isSupabaseEnabled) {
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .delete()
        .eq('parcel_id', parcel.id);
      if (deliveryError) throw deliveryError;
      const { data, error } = await supabase
        .from('parcels')
        .delete()
        .eq('tracking_id', parcel.trackingId)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'Parcel not found in database' });
    }
    store.state.parcels = store.state.parcels.filter((item) => item.id !== parcel.id);
    store.state.deliveries = store.state.deliveries.filter((item) => item.parcelId !== parcel.id);
    store.saveState();
    return res.status(200).json({ success: true, message: 'Parcel deleted successfully' });
  } catch (error) {
    console.error('Error deleting parcel:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete parcel' });
  }
};

export const getBookings = async (req, res) => {
  return getMyParcels(req, res);
};

export const getHistory = async (req, res) => {
  req.query.status = 'DELIVERED';
  return getMyParcels(req, res);
};
