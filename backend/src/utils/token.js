import jwt from "jsonwebtoken"

const isProd = process.env.NODE_ENV === "production"

export const generateToken = (id, role, res) => {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    // Cookie is optional: the frontend also sends the token as "Authorization: Bearer ..."
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: isProd ? "strict" : "lax",
        secure: isProd
    })

    return token
}
