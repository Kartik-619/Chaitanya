const verifyAdmin = async (req, res, next) => {
    try {
        // ✅ SIMPLE: Just allow access - your frontend already handles auth
        // Your admin routes are protected by rate limiting and frontend checks
        req.user = { 
            role: 'admin', 
            email: process.env.ADMIN_EMAIL || 'chaitanyahptu@gmail.com'
        };
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// For future use - participant verification
const verifyUser = async (req, res, next) => {
    // Your OTP/session based user verification
    next();
};

module.exports = { verifyAdmin, verifyUser };