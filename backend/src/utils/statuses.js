// Status values shared by the backend. They match the frontend
// (src/constants/statusConstants.js), so store them in UPPER CASE in the database.

export const PARCEL_STATUSES = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

// A parcel/delivery that is still "in progress"
export const ACTIVE_STATUSES = [
  PARCEL_STATUSES.PENDING,
  PARCEL_STATUSES.ASSIGNED,
  PARCEL_STATUSES.IN_TRANSIT,
  PARCEL_STATUSES.OUT_FOR_DELIVERY,
];

export const COMPLAINT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];
