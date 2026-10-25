import jwt from "jsonwebtoken";

export const generateToken = (id, role, res, email = "") => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }

  const payload = {
    id,
    role,
    email,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: "7d",
  });

  if (res && typeof res.cookie === "function") {
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return token;
};
