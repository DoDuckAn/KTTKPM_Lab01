const express = require("express");
const authController = require("./Controllers/authController");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or Expired Token!" });
    }
};

app.post("/login", authController.login);
app.post("/refresh-token", authController.newAccessToken);

app.get("/protected-data", verifyToken, (req, res) => {
    res.status(200).json({
        message: "Bạn đã truy cập vào vùng dữ liệu bí mật!",
        user: req.user
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Auth Service is running on port ${PORT}`);
});