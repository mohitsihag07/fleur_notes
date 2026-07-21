const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Payment, PaymentTransaction, Order, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_payments',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getPaymentsList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            whereClause[Op.or] = [
                { transaction_id: { [Op.like]: `%${search}%` } },
                { gateway: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Payment.findAndCountAll({
            where: whereClause,
            include: [
                { 
                    model: Order, 
                    as: 'order', 
                    attributes: ['id', 'order_number'],
                    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
                }
            ],
            distinct: true,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        // Aggregate statistics calculation
        const allPayments = await Payment.findAll();
        const paidCount = allPayments.filter(p => p.status === 'paid').length;
        const pendingCount = allPayments.filter(p => p.status === 'pending').length;
        const refundedCount = allPayments.filter(p => p.status === 'refunded').length;
        
        const totalReceived = allPayments
            .filter(p => p.status === 'paid' || p.status === 'refunded')
            .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0)
            .toFixed(2);
            
        const totalRefunded = allPayments
            .reduce((acc, p) => acc + (parseFloat(p.refund_amount) || 0), 0)
            .toFixed(2);

        await logActivity(req.user.id, 'VIEW_PAYMENTS', 'Fetched list of payments', req);

        return helper.success(res, "Payments list fetched successfully", {
            data: rows,
            stats: {
                totalReceived,
                totalRefunded,
                paidCount,
                pendingCount,
                refundedCount
            },
            meta: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return helper.error(res, "Server error fetching payments list", 500);
    }
};

const getPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            where: { id: req.params.id },
            include: [
                { 
                    model: Order, 
                    as: 'order',
                    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
                },
                { model: PaymentTransaction, as: 'transactions' }
            ]
        });
        if (!payment) {
            return helper.error(res, "Payment not found", 404);
        }
        await logActivity(req.user.id, 'VIEW_PAYMENT', `Payment details viewed for ID ${payment.id}`, req);
        return helper.success(res, "Payment found", payment, 200);
    } catch (error) {
        console.error("Error fetching payment:", error);
        return helper.error(res, "Server error fetching payment details", 500);
    }
};

const refundPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({ where: { id: req.params.id } });
        if (!payment) {
            return helper.error(res, "Payment not found", 404);
        }
        const { amount } = req.body;
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return helper.error(res, "Invalid refund amount", 400);
        }

        const newRefundAmount = (Number(payment.refund_amount) || 0) + Number(amount);
        
        await payment.update({
            status: 'refunded',
            refund_amount: newRefundAmount,
            refunded_at: new Date()
        });

        await PaymentTransaction.create({
            payment_id: payment.id,
            type: 'refund',
            status: 'success',
            response: { refunded_amount: amount, total_refunded: newRefundAmount }
        });

        await logActivity(req.user.id, 'REFUND_PAYMENT', `Refunded ${amount} for payment ID ${payment.id}`, req);

        return helper.success(res, "Payment refunded successfully", payment, 200);
    } catch (error) {
        console.error("Error refunding payment:", error);
        return helper.error(res, "Server error refunding payment", 500);
    }
};

module.exports = {
    getPaymentsList,
    getPayment,
    refundPayment
};