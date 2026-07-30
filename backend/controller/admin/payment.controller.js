const db = require("../../models");
const helper = require("../../helper/helper");
const { Payment, PaymentTransaction, Order, User, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try { await AuditLog.create({ user_id: userId, action, module: 'admin_payments', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null }); }
  catch (e) { console.error("Failed to log activity:", e); }
};

const getPaymentsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ transaction_id: { $regex: search, $options: 'i' } }, { gateway: { $regex: search, $options: 'i' } }];

    const [rows, count] = await Promise.all([
      Payment.find(query).populate({ path: 'order_id', select: 'id order_number', populate: { path: 'user_id', select: 'id name email' } }).sort({ created_at: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Payment.countDocuments(query)
    ]);

    const [paidCount, pendingCount, refundedCount] = await Promise.all([
      Payment.countDocuments({ status: 'paid' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'refunded' })
    ]);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: { $in: ['paid', 'refunded'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const refundAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$refund_amount' } } }
    ]);
    const totalReceived = (revenueAgg[0]?.total || 0).toFixed(2);
    const totalRefunded = (refundAgg[0]?.total || 0).toFixed(2);

    const rowsWithData = rows.map(p => ({ ...p, order: p.order_id ? { ...p.order_id, user: p.order_id.user_id } : null }));

    await logActivity(req.user._id, 'VIEW_PAYMENTS', 'Fetched list of payments', req);
    return helper.success(res, "Payments list fetched successfully", {
      data: rowsWithData,
      stats: { totalReceived, totalRefunded, paidCount, pendingCount, refundedCount },
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, "Server error fetching payments list", 500); }
};

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({ path: 'order_id', populate: { path: 'user_id', select: 'id name email' } }).lean({ virtuals: true });
    if (!payment) return helper.error(res, "Payment not found", 404);
    const transactions = await PaymentTransaction.find({ payment_id: payment._id }).lean({ virtuals: true });
    await logActivity(req.user._id, 'VIEW_PAYMENT', `Payment viewed for ID ${payment._id}`, req);
    return helper.success(res, "Payment found", { ...payment, order: payment.order_id ? { ...payment.order_id, user: payment.order_id.user_id } : null, transactions }, 200);
  } catch (e) { return helper.error(res, "Server error fetching payment details", 500); }
};

const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return helper.error(res, "Payment not found", 404);
    const { amount } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) return helper.error(res, "Invalid refund amount", 400);
    const newRefundAmount = (Number(payment.refund_amount) || 0) + Number(amount);
    payment.status = 'refunded';
    payment.refund_amount = newRefundAmount;
    payment.refunded_at = new Date();
    await payment.save();
    await PaymentTransaction.create({ payment_id: payment._id, type: 'refund', status: 'success', response: { refunded_amount: amount, total_refunded: newRefundAmount } });
    await logActivity(req.user._id, 'REFUND_PAYMENT', `Refunded ${amount} for payment ID ${payment._id}`, req);
    return helper.success(res, "Payment refunded successfully", payment, 200);
  } catch (e) { return helper.error(res, "Server error refunding payment", 500); }
};

module.exports = { getPaymentsList, getPayment, refundPayment };