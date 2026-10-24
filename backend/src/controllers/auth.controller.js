import bcrypt from "bcryptjs"
import supabase from "../config/supabase.js"
import { generateToken } from "../utils/token.js"
import { toClientUser } from "../utils/serialize.js"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6
const normalizeEmail = (email) => String(email || "").trim().toLowerCase()

// Customers and employees live in `users`, administrators live in `admin`.
const findAccountByEmail = async (email) => {
    const { data: user, error } = await supabase
        .from("users").select("*").eq("email", email).maybeSingle()
    if (error) throw error
    if (user) return { account: user, table: "users" }

    const { data: admin, error: adminError } = await supabase
        .from("admin").select("*").eq("email", email).maybeSingle()
    if (adminError) throw adminError
    if (admin) return { account: { ...admin, role: "admin" }, table: "admin" }

    return null
}

const findAccountById = async (id, role) => {
    const table = role === "admin" ? "admin" : "users"
    const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle()
    if (error) throw error
    if (!data) return null
    return { account: role === "admin" ? { ...data, role: "admin" } : data, table }
}

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, phone, address, password } = req.body
        const email = normalizeEmail(req.body.email)

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, email and password are required" })
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address" })
        }
        if (String(password).length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
            })
        }

        if (await findAccountByEmail(email)) {
            return res.status(409).json({ success: false, message: "An account with this email already exists." })
        }

        const hashed = await bcrypt.hash(String(password), 10)

        // role is always "customer" here, never taken from the request body
        const { data, error } = await supabase
            .from("users")
            .insert({
                name: String(name).trim(),
                email,
                phone: phone || null,
                address: address || null,
                password: hashed,
                role: "customer",
                status: "active",
            })
            .select("*")
            .single()
        if (error) throw error

        const token = generateToken(data.id, "customer", res)
        return res.status(201).json({ success: true, token, user: toClientUser(data) })
    } catch (error) {
        console.error("Error in register:", error)
        return res.status(500).json({ success: false, message: "Internal error while registering" })
    }
}

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email)
        const { password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" })
        }

        const found = await findAccountByEmail(email)
        // Same message for "no such user" and "wrong password" so emails can't be guessed
        const valid = found && found.account.password
            ? await bcrypt.compare(String(password), found.account.password)
            : false
        if (!valid) {
            return res.status(401).json({ success: false, message: "Invalid email or password" })
        }

        if (found.account.status === "inactive") {
            return res.status(403).json({
                success: false,
                message: "This account has been deactivated. Please contact support."
            })
        }

        const token = generateToken(found.account.id, found.account.role, res)
        return res.status(200).json({ success: true, token, user: toClientUser(found.account) })
    } catch (error) {
        console.error("Error in login:", error)
        return res.status(500).json({ success: false, message: "Internal error while logging in" })
    }
}

// POST /api/auth/logout
export const logout = (req, res) => {
    res.clearCookie("jwt")
    return res.status(200).json({ success: true, message: "Logged out" })
}

// GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const found = await findAccountById(req.user.id, req.user.role)
        if (!found) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        return res.status(200).json({ success: true, user: toClientUser(found.account) })
    } catch (error) {
        console.error("Error in getMe:", error)
        return res.status(500).json({ success: false, message: "Internal error while fetching profile" })
    }
}

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin"
        // Only these fields can be changed here (never role, status, email or password)
        const allowed = isAdmin ? ["name"] : ["name", "phone", "address"]

        const updates = {}
        for (const field of allowed) {
            if (req.body[field] !== undefined) updates[field] = req.body[field]
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: `Provide ${allowed.join(", ")} to update` })
        }

        const { data, error } = await supabase
            .from(isAdmin ? "admin" : "users")
            .update(updates)
            .eq("id", req.user.id)
            .select("*")
            .maybeSingle()
        if (error) throw error
        if (!data) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const account = isAdmin ? { ...data, role: "admin" } : data
        return res.status(200).json({ success: true, user: toClientUser(account) })
    } catch (error) {
        console.error("Error in updateProfile:", error)
        return res.status(500).json({ success: false, message: "Internal error while updating profile" })
    }
}

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current and new password are required" })
        }
        if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters`
            })
        }

        const found = await findAccountById(req.user.id, req.user.role)
        if (!found) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const matches = await bcrypt.compare(String(currentPassword), found.account.password || "")
        if (!matches) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" })
        }

        const hashed = await bcrypt.hash(String(newPassword), 10)
        const { error } = await supabase.from(found.table).update({ password: hashed }).eq("id", req.user.id)
        if (error) throw error

        return res.status(200).json({ success: true, message: "Password updated successfully." })
    } catch (error) {
        console.error("Error in changePassword:", error)
        return res.status(500).json({ success: false, message: "Internal error while changing password" })
    }
}
