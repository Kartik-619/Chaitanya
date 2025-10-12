class AuthController {
  async adminLogin(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    // ✅ SIMPLE & SECURE: Check against .env values
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          email: email,
          role: 'admin'
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  }
}

module.exports = new AuthController();