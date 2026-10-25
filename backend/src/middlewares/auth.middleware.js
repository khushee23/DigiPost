import jwt from "jsonwebtoken";

/**
 * protectRoute Middleware
 * Extracts token from Authorization header (Bearer token) or HTTP cookies.
 * Verifies JWT and attaches decoded user to req.user.
 */
export const protectRoute = (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2. Check cookies as fallback
    else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided. Please log in.",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET must be configured with at least 32 characters.');
    }
    const decoded = jwt.verify(token, secret);

    req.user = decoded; // { id, role, email, iat, exp }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token has expired. Please log in again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid authentication token.",
      });
    }
    console.error(`Error in protectRoute middleware: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Role-based authorization middleware factory
 * Usage: router.get('/path', protectRoute, authorizeRoles('admin', 'employee'), handler)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User session not established",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires one of [${allowedRoles.join(", ")}] role permissions`,
      });
    }

    next();
  };
};

/**
 * adminOnly Middleware
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }
  const role = (req.user.role || '').toString().toLowerCase();
  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Administrator privileges required",
    });
  }
  next();
};

/**
 * employeeOnly Middleware (Admin also permitted)
 */
export const employeeOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }
  const role = (req.user.role || '').toString().toLowerCase();
  if (role !== "employee" && role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Employee / Courier privileges required",
    });
  }
  next();
};

/**
 * customerOnly Middleware (Admin also permitted)
 */
export const customerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
  }
  const role = (req.user.role || '').toString().toLowerCase();
  if (role !== "customer" && role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Customer privileges required",
    });
  }
  next();
};
