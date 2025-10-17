/**
 * 🔐 AUTH CONTROLLER
 * 
 * This file handles authentication operations:
 * - Admin login and credential verification
 * - User authentication (future implementation)
 * 
 * 🛡️ SECURITY:
 * - Validates admin credentials against environment variables
 * - Returns appropriate success/error responses
 */

class AuthController {
  /**
   * Admin login with email and password verification
   */
  async adminLogin(req, res) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

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

// Export controller instance
module.exports = new AuthController();