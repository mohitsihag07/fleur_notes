const mongoose = require('mongoose');
const { Schema } = mongoose;

const userProfileSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profile_picture: { type: String, default: null },
  gender: { type: String, enum: ['male', 'female', 'other', null], default: null },
  date_of_birth: { type: Date, default: null },
  bio: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
module.exports = UserProfile;
