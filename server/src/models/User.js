import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['Warehouse Ops', 'Vendor', 'Gatekeeper']
  }
});

const User = mongoose.model('User', userSchema);
export default User;