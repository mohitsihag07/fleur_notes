'use strict';

// Load all Mongoose models so they are registered with mongoose
const User = require('./User');
const UserProfile = require('./UserProfile');
const UserAddress = require('./UserAddress');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductInventory = require('./ProductInventory');
const ProductVariant = require('./ProductVariant');
const ProductTag = require('./ProductTag');
const ProductTagMap = require('./ProductTagMap');
const Category = require('./Category');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderStatusHistory = require('./OrderStatusHistory');
const Banner = require('./Banner');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const Review = require('./Review');
const Faq = require('./Faq');
const Newsletter = require('./Newsletter');
const Notification = require('./Notification');
const Payment = require('./Payment');
const PaymentTransaction = require('./PaymentTransaction');
const Shipment = require('./Shipment');
const SupportConversation = require('./SupportConversation');
const SupportMessage = require('./SupportMessage');
const ContactMessage = require('./ContactMessage');
const AuditLog = require('./AuditLog');
const CustomerActivity = require('./CustomerActivity');
const PasswordReset = require('./PasswordReset');
const RefreshToken = require('./RefreshToken');
const Setting = require('./Setting');
const Cms = require('./Cms');
const WishlistItem = require('./WishlistItem');

module.exports = {
  User,
  UserProfile,
  UserAddress,
  Product,
  ProductImage,
  ProductInventory,
  ProductVariant,
  ProductTag,
  ProductTagMap,
  Category,
  Order,
  OrderItem,
  OrderStatusHistory,
  Banner,
  Cart,
  CartItem,
  Coupon,
  CouponUsage,
  Review,
  Faq,
  Newsletter,
  Notification,
  Payment,
  PaymentTransaction,
  Shipment,
  SupportConversation,
  SupportMessage,
  ContactMessage,
  AuditLog,
  CustomerActivity,
  PasswordReset,
  RefreshToken,
  Setting,
  Cms,
  WishlistItem,
};
