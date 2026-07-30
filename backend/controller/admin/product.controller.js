const db = require("../../models");
const helper = require("../../helper/helper");
const { Product, Category, ProductImage, ProductInventory, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      module: 'admin_products',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getProductsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const category_id = req.query.category_id || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (category_id) query.category_id = category_id;

    const [rows, count] = await Promise.all([
      Product.find(query)
        .populate('category_id', 'id name slug')
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Product.countDocuments(query)
    ]);

    // Attach images and inventory to each product
    const productIds = rows.map(p => p._id);
    const [images, inventories] = await Promise.all([
      ProductImage.find({ product_id: { $in: productIds } }).lean({ virtuals: true }),
      ProductInventory.find({ product_id: { $in: productIds } }).lean({ virtuals: true })
    ]);

    const rowsWithData = rows.map(product => ({
      ...product,
      id: product._id,
      category: product.category_id,
      images: images.filter(img => String(img.product_id) === String(product._id)),
      inventory: inventories.find(inv => String(inv.product_id) === String(product._id)) || null,
    }));

    const [totalProducts, activeProducts, inactiveProducts, lowStockProducts] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'inactive' }),
      ProductInventory.countDocuments({ quantity: { $lte: 5 } })
    ]);

    if (req.user) await logActivity(req.user._id, 'VIEW_PRODUCTS', 'Fetched list of products', req);

    return helper.success(res, 'Successfully fetched list of products', {
      data: rowsWithData,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
        stats: { totalProducts, activeProducts, inactiveProducts, lowStockProducts }
      }
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return helper.error(res, 'Server error loading products', 500);
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
      return helper.error(res, "Invalid product ID specified", 400);
    }

    const mongoose = require('mongoose');
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate('category_id', 'id name slug')
        .lean({ virtuals: true });
    }

    if (!product) {
      product = await Product.findOne({ $or: [{ slug: id }, { sku: id }] })
        .populate('category_id', 'id name slug')
        .lean({ virtuals: true });
    }

    if (!product) return helper.error(res, "Product not found", 404);

    const [images, inventory] = await Promise.all([
      ProductImage.find({ product_id: product._id }).lean({ virtuals: true }),
      ProductInventory.findOne({ product_id: product._id }).lean({ virtuals: true })
    ]);

    const result = { ...product, id: product._id, category: product.category_id, images, inventory };
    if (req.user) await logActivity(req.user._id, 'VIEW_PRODUCT', `Product details viewed for ID ${id}`, req);
    return helper.success(res, "Product found", result, 200);
  } catch (error) {
    console.error("Error loading product:", error);
    return helper.error(res, "Server error loading product", 500);
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      name, category_id, sku, price, sale_price, slug, description, short_description, status, quantity,
      is_new_arrival, is_best_seller, is_featured, is_new, is_bestseller,
      weight, length, width, height, color
    } = req.body;

    if (!name || !category_id || price === undefined) {
      return helper.error(res, "Missing required fields: name, category_id, and price are required", 400);
    }

    const category = await Category.findById(category_id);
    if (!category) return helper.error(res, "Category not found", 400);

    let finalSku = sku;
    if (!finalSku) {
      finalSku = `PRD-${Date.now()}`;
    } else {
      const existingSku = await Product.findOne({ sku: finalSku });
      if (existingSku) return helper.error(res, "SKU already exists", 400);
    }

    let finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let uniqueSlug = finalSlug;
    let suffix = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${finalSlug}-${suffix}`;
      suffix++;
    }

    const parseBool = (val) => val === 'true' || val === true || val === 1 || val === '1';

    const product = await Product.create({
      name,
      category_id,
      sku: finalSku,
      slug: uniqueSlug,
      price: parseFloat(price),
      sale_price: sale_price ? parseFloat(sale_price) : null,
      description: description || '',
      short_description: short_description || '',
      status: status || 'active',
      is_new_arrival: is_new_arrival !== undefined ? parseBool(is_new_arrival) : (is_new !== undefined ? parseBool(is_new) : false),
      is_best_seller: is_best_seller !== undefined ? parseBool(is_best_seller) : (is_bestseller !== undefined ? parseBool(is_bestseller) : false),
      is_featured: is_featured !== undefined ? parseBool(is_featured) : false,
      weight: weight ? parseFloat(weight) : null,
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      color: color || null
    });

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < Math.min(req.files.length, 4); i++) {
        const file = req.files[i];
        await ProductImage.create({
          product_id: product._id,
          image: `/images/products/${file.filename}`,
          is_thumbnail: i === 0,
          sort_order: i
        });
      }
    }

    const initialQty = parseInt(quantity) || 0;
    await ProductInventory.create({ product_id: product._id, quantity: initialQty });

    await logActivity(req.user._id, 'ADD_PRODUCT', `Product '${name}' added successfully`, req);
    return helper.success(res, "Product added successfully", product, 201);
  } catch (error) {
    console.error("Error adding product:", error);
    return helper.error(res, "Server error adding product", 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return helper.error(res, "Product not found", 404);

    const {
      name, category_id, sku, price, sale_price, slug, description, short_description, status, quantity,
      is_new_arrival, is_best_seller, is_featured, is_new, is_bestseller,
      weight, length, width, height, color
    } = req.body;

    if (category_id !== undefined) {
      const category = await Category.findById(category_id);
      if (!category) return helper.error(res, "Category not found", 400);
    }

    if (sku !== undefined && sku !== product.sku) {
      const existingSku = await Product.findOne({ sku });
      if (existingSku) return helper.error(res, "SKU already exists", 400);
    }

    let finalSlug = slug;
    if (name && !slug) {
      finalSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (finalSlug && finalSlug !== product.slug) {
      let uniqueSlug = finalSlug;
      let suffix = 1;
      while (await Product.findOne({ slug: uniqueSlug, _id: { $ne: req.params.id } })) {
        uniqueSlug = `${finalSlug}-${suffix}`;
        suffix++;
      }
      finalSlug = uniqueSlug;
    }

    const parseBool = (val) => val === 'true' || val === true || val === 1 || val === '1';

    if (name) product.name = name;
    if (category_id) product.category_id = category_id;
    if (sku) product.sku = sku;
    if (finalSlug) product.slug = finalSlug;
    if (price !== undefined) product.price = parseFloat(price);
    if (sale_price !== undefined) product.sale_price = sale_price ? parseFloat(sale_price) : null;
    if (description !== undefined) product.description = description;
    if (short_description !== undefined) product.short_description = short_description;
    if (status) product.status = status;
    if (is_new_arrival !== undefined) product.is_new_arrival = parseBool(is_new_arrival);
    if (is_new !== undefined) product.is_new_arrival = parseBool(is_new);
    if (is_best_seller !== undefined) product.is_best_seller = parseBool(is_best_seller);
    if (is_bestseller !== undefined) product.is_best_seller = parseBool(is_bestseller);
    if (is_featured !== undefined) product.is_featured = parseBool(is_featured);
    if (weight !== undefined) product.weight = weight ? parseFloat(weight) : null;
    if (length !== undefined) product.length = length ? parseFloat(length) : null;
    if (width !== undefined) product.width = width ? parseFloat(width) : null;
    if (height !== undefined) product.height = height ? parseFloat(height) : null;
    if (color !== undefined) product.color = color || null;
    await product.save();

    // Handle existing images
    let existingImagesList = [];
    if (req.body.existing_images) {
      try {
        existingImagesList = typeof req.body.existing_images === 'string'
          ? JSON.parse(req.body.existing_images)
          : req.body.existing_images;
      } catch (e) { existingImagesList = []; }
    }

    if (req.body.existing_images !== undefined) {
      const allCurrent = await ProductImage.find({ product_id: product._id });
      for (const img of allCurrent) {
        if (!existingImagesList.includes(img.image)) {
          await ProductImage.findByIdAndDelete(img._id);
        }
      }
    }

    if (req.files && req.files.length > 0) {
      const currentCount = await ProductImage.countDocuments({ product_id: product._id });
      for (let i = 0; i < req.files.length && (currentCount + i) < 4; i++) {
        const file = req.files[i];
        await ProductImage.create({
          product_id: product._id,
          image: `/images/products/${file.filename}`,
          is_thumbnail: (currentCount === 0 && i === 0),
          sort_order: currentCount + i
        });
      }
    }

    const remainingImages = await ProductImage.find({ product_id: product._id }).sort({ sort_order: 1 });
    if (remainingImages.length > 0 && !remainingImages.some(img => img.is_thumbnail)) {
      remainingImages[0].is_thumbnail = true;
      await remainingImages[0].save();
    }

    if (quantity !== undefined) {
      const newQty = parseInt(quantity) || 0;
      let inventory = await ProductInventory.findOne({ product_id: product._id });
      if (inventory) {
        inventory.quantity = newQty;
        await inventory.save();
      } else {
        await ProductInventory.create({ product_id: product._id, quantity: newQty });
      }
    }

    await logActivity(req.user._id, 'EDIT_PRODUCT', `Product details edited for ID ${product._id}`, req);
    return helper.success(res, "Product updated successfully", product, 200);
  } catch (error) {
    console.error("Error updating product:", error);
    return helper.error(res, "Server error updating product", 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return helper.error(res, "Product not found", 404);
    await Product.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_PRODUCT', `Product deleted for ID ${product._id}`, req);
    return helper.success(res, "Product deleted successfully", {}, 200);
  } catch (error) {
    console.error("Error deleting product:", error);
    return helper.error(res, "Server error deleting product", 500);
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return helper.error(res, "Product not found", 404);

    const oldStatus = product.status;
    let newStatus;
    if (req.body.status !== undefined) {
      newStatus = req.body.status;
      if (!['active', 'inactive'].includes(newStatus)) return helper.error(res, "Invalid status value", 400);
    } else {
      newStatus = oldStatus === 'active' ? 'inactive' : 'active';
    }

    product.status = newStatus;
    await product.save();
    await logActivity(req.user._id, 'UPDATE_PRODUCT_STATUS', `Product status updated from ${oldStatus} to ${newStatus}`, req);
    return helper.success(res, "Product status updated successfully", product, 200);
  } catch (error) {
    console.error("Error updating product status:", error);
    return helper.error(res, "Server error updating product status", 500);
  }
};

module.exports = {
  getProductsList,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus
};
