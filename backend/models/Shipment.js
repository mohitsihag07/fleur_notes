const mongoose = require('mongoose');
const { Schema } = mongoose;

const shipmentSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  tracking_number: { type: String, default: null },
  shipping_company: { type: String, default: null },
  tracking_url: { type: String, default: null },
  expected_delivery: { type: Date, default: null },
  shipped_at: { type: Date, default: null },
  delivered_at: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

shipmentSchema.index({ tracking_number: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);
module.exports = Shipment;
