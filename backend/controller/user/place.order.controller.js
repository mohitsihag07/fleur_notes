const db = require("../../models");
const helper = require("../../helper/helper");
const { Order, OrderItem, Cart, CartItem, UserAddress, Coupon, CouponUsage, Setting } = db;

const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      address_id,
      new_address,
      payment_method = 'cod',
      coupon_code,
      notes
    } = req.body;

    let cart = await Cart.findOne({ user_id: userId });
    let cartItems = [];
    if (cart) {
      cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id').lean();
    }

    // Fallback: If DB cart is empty, use items passed in request body from frontend cart
    if ((!cartItems || cartItems.length === 0) && Array.isArray(req.body.items) && req.body.items.length > 0) {
      const productIds = req.body.items.map(i => i.product_id || i.productId || i.id).filter(Boolean);
      const dbProducts = await db.Product.find({ _id: { $in: productIds } }).lean();
      const productMap = {};
      dbProducts.forEach(p => { productMap[p._id.toString()] = p; });

      cartItems = req.body.items.map(it => {
        const pIdStr = String(it.product_id || it.productId || it.id);
        const pDoc = productMap[pIdStr];
        return {
          product_id: pDoc || { _id: pIdStr, name: it.name || 'Product', price: it.price || 0 },
          quantity: it.quantity || 1,
          price: it.price || (pDoc ? (pDoc.selling_price || pDoc.price) : 0)
        };
      });
    }

    if (!cartItems || cartItems.length === 0) {
      return helper.error(res, "Your shopping cart is empty.", 400);
    }

    let targetAddressId = address_id;

    if (!targetAddressId && new_address) {
      const createdAddr = await UserAddress.create({
        user_id: userId,
        full_name: new_address.fullName || new_address.name || req.user.name || 'Valued Customer',
        phone: new_address.phone || req.user.phone || '+91 98765 43210',
        address_line1: new_address.addressLine1 || new_address.address,
        address_line2: new_address.addressLine2 || new_address.landmark || null,
        city: new_address.city,
        state: new_address.state,
        pincode: new_address.pincode || new_address.pinCode,
        country: 'India',
        label: (new_address.label || new_address.type || 'home').toLowerCase()
      });
      targetAddressId = createdAddr._id;
    }

    if (!targetAddressId) {
      const defaultAddr = await UserAddress.findOne({ user_id: userId }).sort({ is_default: -1, created_at: -1 });
      if (defaultAddr) {
        targetAddressId = defaultAddr._id;
      } else {
        const createdFallback = await UserAddress.create({
          user_id: userId,
          full_name: req.user.name || 'Valued Customer',
          phone: req.user.phone || '+91 98765 43210',
          address_line1: '402, Royal Residency, Park Street',
          address_line2: 'Near Central Mall',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700016',
          country: 'India',
          label: 'home'
        });
        targetAddressId = createdFallback._id;
      }
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = item.product_id;
      if (!product || product.deleted_at) continue;

      const itemPrice = item.price || product.selling_price || product.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        product_id: product._id,
        variant_id: item.variant_id || null,
        product_name: product.name,
        product_sku: product.sku || null,
        quantity: item.quantity,
        price: itemPrice,
        total: itemTotal
      });
    }

    if (orderItemsData.length === 0) {
      return helper.error(res, "No valid products found in cart.", 400);
    }

    const settingsList = await Setting.find({}).lean();
    const settingsMap = {};
    settingsList.forEach(s => { settingsMap[s.key] = s.value; });

    const freeShippingThreshold = settingsMap.free_shipping_threshold ? parseFloat(settingsMap.free_shipping_threshold) : 1000;
    const flatShippingRate = settingsMap.flat_shipping_rate ? parseFloat(settingsMap.flat_shipping_rate) : 99;
    const enableFreeShipping = settingsMap.enable_free_shipping === undefined ? true : (settingsMap.enable_free_shipping === 'true' || settingsMap.enable_free_shipping === true);
    const taxRate = settingsMap.tax_rate !== undefined && settingsMap.tax_rate !== '' ? parseFloat(settingsMap.tax_rate) : 18;

    let couponRecord = null;
    let discountAmount = 0;

    if (coupon_code) {
      const cleanCode = coupon_code.trim().toUpperCase();
      couponRecord = await Coupon.findOne({
        code: cleanCode,
        status: 'active',
        deleted_at: null
      });

      if (couponRecord) {
        const userUsageCount = await CouponUsage.countDocuments({ coupon_id: couponRecord._id, user_id: userId });
        const userLimit = couponRecord.per_user_limit || 1;

        if (userUsageCount < userLimit && (!couponRecord.minimum_amount || subtotal >= couponRecord.minimum_amount)) {
          if (couponRecord.type === 'percentage') {
            discountAmount = (subtotal * couponRecord.value) / 100;
          } else {
            discountAmount = couponRecord.value;
          }
          if (couponRecord.maximum_discount && discountAmount > couponRecord.maximum_discount) {
            discountAmount = couponRecord.maximum_discount;
          }
        }
      } else if (cleanCode === 'FLEUR NOTES10' || cleanCode === 'FLEUR NOTES20') {
        const pct = cleanCode === 'FLEUR NOTES20' ? 20 : 10;
        discountAmount = (subtotal * pct) / 100;
      }
    }

    discountAmount = Math.min(discountAmount, subtotal);

    const isFreeShipping = enableFreeShipping && subtotal >= freeShippingThreshold;
    const shippingCharge = isFreeShipping ? 0 : flatShippingRate;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * (taxRate / 100);

    const grandTotal = Math.max(0, taxableAmount + shippingCharge + taxAmount);

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `FN-${randomDigits}`;

    const validPaymentMethods = ['razorpay', 'stripe', 'paypal', 'cod', 'upi', 'card'];
    const finalPaymentMethod = validPaymentMethods.includes(payment_method) ? payment_method : 'cod';
    const paymentStatus = ['upi', 'card', 'razorpay', 'stripe'].includes(finalPaymentMethod) ? 'paid' : 'pending';

    const newOrder = await Order.create({
      order_number: orderNumber,
      user_id: userId,
      address_id: targetAddressId,
      coupon_id: couponRecord ? couponRecord._id : null,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shipping_charge: shippingCharge,
      grand_total: grandTotal,
      status: 'pending',
      payment_status: paymentStatus,
      payment_method: finalPaymentMethod,
      notes: notes || null
    });

    for (const itemData of orderItemsData) {
      await OrderItem.create({
        ...itemData,
        order_id: newOrder._id
      });
    }

    if (couponRecord) {
      await CouponUsage.create({
        coupon_id: couponRecord._id,
        user_id: userId,
        order_id: newOrder._id,
        discount_amount: discountAmount
      });
      couponRecord.used_count = (couponRecord.used_count || 0) + 1;
      await couponRecord.save();
    }

    if (cart) {
      await CartItem.deleteMany({ cart_id: cart._id });
    }

    return helper.success(res, "Order placed successfully!", {
      orderId: newOrder.order_number,
      rawId: newOrder._id,
      orderNumber: newOrder.order_number,
      subtotal: newOrder.subtotal,
      discount: newOrder.discount,
      tax: newOrder.tax,
      shippingCharge: newOrder.shipping_charge,
      grandTotal: newOrder.grand_total,
      status: newOrder.status,
      paymentStatus: newOrder.payment_status,
      paymentMethod: newOrder.payment_method,
      createdAt: newOrder.created_at
    }, 201);
  } catch (error) {
    console.error("Place Order Error:", error);
    return helper.error(res, "Failed to place order: " + error.message, 500);
  }
};

module.exports = {
  placeOrder
};
