import store from '../services/store.js';

/**
 * GET /api/analytics/customer-summary?customerId=...
 */
export const getCustomerSummary = async (req, res) => {
  try {
    let customerId = req.query.customerId || req.user?.id;
    // Security: Customer can only view their own analytics
    if (req.user?.role === 'customer') {
      customerId = req.user.id;
    }
    const stats = store.getCustomerStats(customerId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error in getCustomerSummary:', error);
    return res.status(500).json({ success: false, message: 'Failed to load customer analytics' });
  }
};

/**
 * GET /api/analytics/employee-summary?employeeId=...
 */
export const getEmployeeSummary = async (req, res) => {
  try {
    let employeeId = req.query.employeeId || req.user?.id;
    if (req.user?.role === 'employee') {
      employeeId = req.user.id;
    }
    const stats = store.getEmployeeStats(employeeId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error in getEmployeeSummary:', error);
    return res.status(500).json({ success: false, message: 'Failed to load employee analytics' });
  }
};

/**
 * GET /api/analytics/admin-summary & GET /api/analytics/dashboard
 */
export const getAdminSummary = async (req, res) => {
  try {
    const stats = store.getAdminStats();

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error in getAdminSummary:', error);
    return res.status(500).json({ success: false, message: 'Failed to load admin analytics' });
  }
};

/**
 * GET /api/analytics/deliveries
 */
export const getDeliveriesAnalytics = async (req, res) => {
  try {
    const stats = store.getAdminStats();
    return res.status(200).json({
      success: true,
      pendingDeliveries: stats.pendingDeliveries,
      inTransitDeliveries: stats.inTransitDeliveries,
      completedDeliveries: stats.completedDeliveries,
      failedDeliveries: stats.failedDeliveries,
      statusDistribution: stats.statusDistribution,
      weeklyVolume: stats.weeklyVolume,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};

/**
 * GET /api/analytics/revenue
 */
export const getRevenueAnalytics = async (req, res) => {
  try {
    const stats = store.getAdminStats();
    return res.status(200).json({
      success: true,
      totalEstimatedRevenue: stats.totalRevenue,
      monthlyVolume: stats.monthlyVolume,
      note: 'Revenue figures represent project-defined estimated delivery charges.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};
