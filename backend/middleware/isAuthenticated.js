import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if Bearer token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token using THE SAME SECRET used during login
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store user information
    req.userId = decoded.userId;
    req.user = decoded;

    console.log("AUTHENTICATED USER ID:", req.userId);

    next();

  } catch (error) {
    console.error("Error in isAuthenticated:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};