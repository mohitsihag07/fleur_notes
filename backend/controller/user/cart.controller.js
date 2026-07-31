const db = require("../../models");
const helper = require("../../helper/helper");
const { Cart, CartItem, Product, ProductImage } = db;

const formatCartItems = async (cartItems) => {
  const formatted = [];
  for (const item of cartItems) {
    const product = item.product_id;
    if (!product || product.deleted_at) continue;

    let imageUrl = null;
    const prodImg = await ProductImage.findOne({ product_id: product._id, is_thumbnail: true }).lean() 
      || await ProductImage.findOne({ product_id: product._id }).sort({ is_thumbnail: -1, sort_order: 1 }).lean();
    
    if (prodImg) {
      imageUrl = prodImg.image || prodImg.image_url;
    }

    formatted.push({
      cartItemId: item._id,
      id: product._id,
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: item.price || product.sale_price || product.selling_price || product.price,
      originalPrice: product.price,
      quantity: item.quantity,
      image: imageUrl,
      category: product.category_id ? product.category_id.name : null
    });
  }
  return formatted;
};

const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatCartItems(cartItems);
    return helper.success(res, "Cart fetched successfully", { items: formatted }, 200);
  } catch (error) {
    console.error("Get Cart Error:", error);
    return helper.error(res, "Failed to fetch cart", 500);
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return helper.error(res, "Product ID is required", 400);
    }

    const product = await Product.findById(productId);
    if (!product || product.deleted_at) {
      return helper.error(res, "Product not found", 404);
    }

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    let item = await CartItem.findOne({ cart_id: cart._id, product_id: productId });
    if (item) {
      item.quantity += Number(quantity);
      item.price = product.selling_price || product.price;
      await item.save();
    } else {
      item = await CartItem.create({
        cart_id: cart._id,
        product_id: productId,
        quantity: Number(quantity),
        price: product.selling_price || product.price
      });
    }

    const allItems = await CartItem.find({ cart_id: cart._id })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatCartItems(allItems);
    return helper.success(res, "Product added to cart", { items: formatted }, 200);
  } catch (error) {
    console.error("Add To Cart Error:", error);
    return helper.error(res, "Failed to add to cart", 500);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return helper.error(res, "Product ID and quantity are required", 400);
    }

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return helper.error(res, "Cart not found", 404);

    const isObjectId = String(productId).match(/^[0-9a-fA-F]{24}$/);
    if (Number(quantity) <= 0) {
      if (isObjectId) {
        await CartItem.deleteMany({
          cart_id: cart._id,
          $or: [{ product_id: productId }, { _id: productId }]
        });
      }
    } else {
      let item = isObjectId 
        ? await CartItem.findOne({ cart_id: cart._id, $or: [{ product_id: productId }, { _id: productId }] })
        : null;
      if (item) {
        item.quantity = Number(quantity);
        await item.save();
      }
    }

    const allItems = await CartItem.find({ cart_id: cart._id })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatCartItems(allItems);
    return helper.success(res, "Cart updated successfully", { items: formatted }, 200);
  } catch (error) {
    console.error("Update Cart Error:", error);
    return helper.error(res, "Failed to update cart", 500);
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user_id: userId });
    if (cart) {
      const isObjectId = String(productId).match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        await CartItem.deleteMany({
          cart_id: cart._id,
          $or: [{ product_id: productId }, { _id: productId }]
        });
      }
    }

    const allItems = cart 
      ? await CartItem.find({ cart_id: cart._id })
        .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
        .lean()
      : [];

    const formatted = await formatCartItems(allItems);
    return helper.success(res, "Item removed from cart", { items: formatted }, 200);
  } catch (error) {
    console.error("Remove From Cart Error:", error);
    return helper.error(res, "Failed to remove item from cart", 500);
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user_id: userId });
    if (cart) {
      await CartItem.deleteMany({ cart_id: cart._id });
    }
    return helper.success(res, "Cart cleared successfully", { items: [] }, 200);
  } catch (error) {
    console.error("Clear Cart Error:", error);
    return helper.error(res, "Failed to clear cart", 500);
  }
};

const syncCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items = [] } = req.body;

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    for (const localItem of items) {
      const pId = localItem.productId || localItem.id;
      if (!pId) continue;

      const product = await Product.findById(pId);
      if (!product || product.deleted_at) continue;

      let item = await CartItem.findOne({ cart_id: cart._id, product_id: pId });
      if (item) {
        item.quantity = Math.max(item.quantity, Number(localItem.quantity || 1));
        await item.save();
      } else {
        await CartItem.create({
          cart_id: cart._id,
          product_id: pId,
          quantity: Number(localItem.quantity || 1),
          price: product.selling_price || product.price
        });
      }
    }

    const allItems = await CartItem.find({ cart_id: cart._id })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatCartItems(allItems);
    return helper.success(res, "Cart synced successfully", { items: formatted }, 200);
  } catch (error) {
    console.error("Sync Cart Error:", error);
    return helper.error(res, "Failed to sync cart", 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};
