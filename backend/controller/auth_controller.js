import user_models from "../models/users_model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ==========================================
// SIGNUP
// ==========================================
export const signupController = async (req, res) => {
  try {
    try {
        const { username, email, password } = req.body;
    
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required.' });
        }
    
        const existingUser = await user_models.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists with this email.' });
        }
    
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
    
        const user = await user_models.create({ username, email, passwordHash });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
        res.status(201).json({ token, userId: user._id, email: user.email });
      } catch (error) {
        res.status(500).json({ error: 'Server error during registration.' });
      }
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration.' });
      }
    }
/// ==========================================
// LOGIN
// ==========================================
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required.' });
        }
    
        const user = await user_models.findOne({ email });
        if (!user) {
          return res.status(400).json({ error: 'Invalid email or password.' });
        }
    
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(400).json({ error: 'Invalid email or password.' });
        }
    
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
        res.json({ token, userId: user._id, email: user.email, username:user.username });
      } catch (error) {
        res.status(500).json({ error: 'Server error during login.' });
      }
    }