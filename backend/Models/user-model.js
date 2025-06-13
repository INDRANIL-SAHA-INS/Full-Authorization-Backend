import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lastlogin: { type: Date, default: Date.now }, // Set default to today's date
    isverified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetpasswordToken: { type: String },
    resetpasswordExpiresAt: { type: Date },
    verificationExpiresAt: { type: Date },
  },
  { timestamps: true }
);

const Usermodel = mongoose.model('User', userSchema);

export default Usermodel;