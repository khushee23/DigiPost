import jwt from "jsonwebtoken"

// Accept the token from "Authorization: Bearer <token>" (what the frontend sends)
// or from the httpOnly "jwt" cookie.
const getToken = (req) => {
    const header = req.headers.authorization
    if (header && header.startsWith("Bearer ")) {
        return header.slice(7)
    }
    return req.cookies?.jwt || null
}

export const protectRoute = (req, res, next) => {
    const token = getToken(req)
    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No token provided" })
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        // Bad or expired token is the client's problem (401), not a server error (500)
        return res.status(401).json({
            message: error.name === "TokenExpiredError"
                ? "Session expired, please log in again"
                : "Unauthorized - Invalid token"
        })
    }
}

export const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" })
    }
    next()
}

// Allows the request when the logged-in user is an admin, or when the id in the URL
// is their own id. Example: selfOrAdmin("customerId") for /customers/:customerId/...
export const selfOrAdmin = (paramName = "id") => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    if (req.user.role === "admin" || String(req.user.id) === String(req.params[paramName])) {
        return next()
    }
    return res.status(403).json({ message: "Access denied" })
}
