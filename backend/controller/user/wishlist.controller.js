const db = require("../../models");
const helper = require("../../helper/helper");
const { WishlistItem, Product, ProductImage } = db;

const formatWishlistItems = async (wishlistItems) => {
  const formatted = [];
  for (const item of wishlistItems) {
    const product = item.product_id;
    if (!product || product.deleted_at) continue;

    let imageUrl = null;
    const prodImg = await ProductImage.findOne({ product_id: product._id, is_thumbnail: true }).lean() 
      || await ProductImage.findOne({ product_id: product._id }).lean();
    
    if (prodImg && prodImg.image) {
      const cleanImg = prodImg.image.trim();
      imageUrl = cleanImg.startsWith('http') 
        ? cleanImg 
        : (cleanImg.startsWith('/') ? `http://localhost:3131${cleanImg}` : `http://localhost:3131/${cleanImg}`);
    } else if (product.image) {
      const cleanImg = product.image.trim();
      imageUrl = cleanImg.startsWith('http') 
        ? cleanImg 
        : (cleanImg.startsWith('/') ? `http://localhost:3131${cleanImg}` : `http://localhost:3131/${cleanImg}`);
    }

    formatted.push({
      wishlistItemId: item._id,
      id: product._id,
      productId: product._id,
      name: product.name,
      slug: product.slug,
      price: product.selling_price || product.price,
      originalPrice: product.original_price || product.price,
      image: imageUrl || product.image || null,
      images: prodImg ? [prodImg] : [],
      category: product.category_id ? product.category_id.name : null,
      inStock: (product.stock || 0) > 0
    });
  }
  return formatted;
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlistItems = await WishlistItem.find({ user_id: userId })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatWishlistItems(wishlistItems);
    return helper.success(res, "Wishlist fetched successfully", { items: formatted }, 200);
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return helper.error(res, "Failed to fetch wishlist", 500);
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return helper.error(res, "Product ID is required", 400);
    }

    const product = await Product.findById(productId);
    if (!product || product.deleted_at) {
      return helper.error(res, "Product not found", 404);
    }

    const existing = await WishlistItem.findOne({ user_id: userId, product_id: productId });
    let isAdded = false;

    if (existing) {
      await WishlistItem.deleteOne({ _id: existing._id });
      isAdded = false;
    } else {
      await WishlistItem.create({ user_id: userId, product_id: productId });
      isAdded = true;
    }

    const wishlistItems = await WishlistItem.find({ user_id: userId })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatWishlistItems(wishlistItems);
    return helper.success(
      res, 
      isAdded ? "Added to wishlist" : "Removed from wishlist", 
      { isAdded, items: formatted }, 
      200
    );
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return helper.error(res, "Failed to toggle wishlist item", 500);
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    await WishlistItem.deleteOne({ user_id: userId, product_id: productId });

    const wishlistItems = await WishlistItem.find({ user_id: userId })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatWishlistItems(wishlistItems);
    return helper.success(res, "Removed from wishlist", { items: formatted }, 200);
  } catch (error) {
    console.error("Remove From Wishlist Error:", error);
    return helper.error(res, "Failed to remove from wishlist", 500);
  }
};

const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    await WishlistItem.deleteMany({ user_id: userId });
    return helper.success(res, "Wishlist cleared successfully", { items: [] }, 200);
  } catch (error) {
    console.error("Clear Wishlist Error:", error);
    return helper.error(res, "Failed to clear wishlist", 500);
  }
};

const syncWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items = [] } = req.body;

    for (const localItem of items) {
      const pId = localItem.productId || localItem.id;
      if (!pId) continue;

      const product = await Product.findById(pId);
      if (!product || product.deleted_at) continue;

      const existing = await WishlistItem.findOne({ user_id: userId, product_id: pId });
      if (!existing) {
        await WishlistItem.create({ user_id: userId, product_id: pId });
      }
    }

    const wishlistItems = await WishlistItem.find({ user_id: userId })
      .populate({ path: 'product_id', populate: { path: 'category_id', select: 'name' } })
      .lean();

    const formatted = await formatWishlistItems(wishlistItems);
    return helper.success(res, "Wishlist synced successfully", { items: formatted }, 200);
  } catch (error) {
    console.error("Sync Wishlist Error:", error);
    return helper.error(res, "Failed to sync wishlist", 500);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
  syncWishlist
};
