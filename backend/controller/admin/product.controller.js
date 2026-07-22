const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Product, Category, ProductImage, ProductInventory, ProductTag, Review, User, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
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
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    if (category_id) {
      whereClause.category_id = category_id;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductImage, as: 'images', required: false, attributes: ['id', 'image', 'is_thumbnail', 'sort_order'] },
        { model: ProductInventory, as: 'inventory', required: false, attributes: ['quantity', 'reserved_quantity'] }
      ],
      distinct: true,
      limit,
      offset,
      order: [['id', 'DESC']]
    });
    
    // Calculate product statistics
    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { status: 'active' } });
    const inactiveProducts = await Product.count({ where: { status: 'inactive' } });
    const lowStockProducts = await ProductInventory.count({ where: { quantity: { [Op.lte]: 5 } } });

    if (req.user) {
      await logActivity(req.user.id, 'VIEW_PRODUCTS', 'Fetched list of products', req);
    }
    
    return helper.success(res, 'Successfully fetched list of products', {
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
        stats: {
          totalProducts,
          activeProducts,
          inactiveProducts,
          lowStockProducts
        }
      }
    });
  } catch (error) {
    console.error(`Error loading products:`, error);
    return helper.error(res, 'Server error loading products', 500);
  }
}; 

const getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            where: { id: req.params.id },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: ProductImage, as: 'images', required: false, attributes: ['id', 'image', 'is_thumbnail', 'sort_order'] },
                { model: ProductInventory, as: 'inventory', required: false, attributes: ['quantity', 'reserved_quantity'] }
            ]
        });
        if (!product) {
            return helper.error(res, "Product not found", 404);
        }
        if (req.user) {
          await logActivity(req.user.id, 'VIEW_PRODUCT', `Product details viewed for ID ${req.params.id}`, req);
        }
        return helper.success(res, "Product found", product, 200);
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

    // Check if category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return helper.error(res, "Category not found", 400);
    }

    // Generate unique SKU if missing
    let finalSku = sku;
    if (!finalSku) {
      finalSku = `PRD-${Date.now()}`;
    } else {
      const existingSku = await Product.findOne({ where: { sku: finalSku } });
      if (existingSku) {
        return helper.error(res, "SKU already exists", 400);
      }
    }

    // Generate unique slug
    let finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let uniqueSlug = finalSlug;
    let suffix = 1;
    while (await Product.findOne({ where: { slug: uniqueSlug } })) {
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

    // Handle Multiple Images Upload (up to 4)
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < Math.min(req.files.length, 4); i++) {
        const file = req.files[i];
        await ProductImage.create({
          product_id: product.id,
          image: `/images/products/${file.filename}`,
          is_thumbnail: i === 0,
          sort_order: i
        });
      }
    }

    // Handle Stock Inventory
    const initialQty = parseInt(quantity) || 0;
    await ProductInventory.create({
      product_id: product.id,
      quantity: initialQty
    });

    await logActivity(req.user.id, 'ADD_PRODUCT', `Product '${name}' added successfully with ID ${product.id}`, req);
    return helper.success(res, "Product added successfully", product, 201);
  } catch (error) {
    console.error("Error adding product:", error);
    return helper.error(res, "Server error adding product", 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) {
      return helper.error(res, "Product not found", 404);
    }

    const { 
      name, category_id, sku, price, sale_price, slug, description, short_description, status, quantity,
      is_new_arrival, is_best_seller, is_featured, is_new, is_bestseller,
      weight, length, width, height, color
    } = req.body;

    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return helper.error(res, "Category not found", 400);
      }
    }

    if (sku !== undefined && sku !== product.sku) {
      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku) {
        return helper.error(res, "SKU already exists", 400);
      }
    }

    let finalSlug = slug;
    if (name && !slug) {
      finalSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (finalSlug && finalSlug !== product.slug) {
      let uniqueSlug = finalSlug;
      let suffix = 1;
      while (await Product.findOne({ where: { slug: uniqueSlug, id: { [Op.ne]: req.params.id } } })) {
        uniqueSlug = `${finalSlug}-${suffix}`;
        suffix++;
      }
      finalSlug = uniqueSlug;
    }

    const parseBool = (val) => val === 'true' || val === true || val === 1 || val === '1';

    await product.update({
      ...(name && { name }),
      ...(category_id && { category_id }),
      ...(sku && { sku }),
      ...(finalSlug && { slug: finalSlug }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(sale_price !== undefined && { sale_price: sale_price ? parseFloat(sale_price) : null }),
      ...(description !== undefined && { description }),
      ...(short_description !== undefined && { short_description }),
      ...(status && { status }),
      ...(is_new_arrival !== undefined && { is_new_arrival: parseBool(is_new_arrival) }),
      ...(is_new !== undefined && { is_new_arrival: parseBool(is_new) }),
      ...(is_best_seller !== undefined && { is_best_seller: parseBool(is_best_seller) }),
      ...(is_bestseller !== undefined && { is_best_seller: parseBool(is_bestseller) }),
      ...(is_featured !== undefined && { is_featured: parseBool(is_featured) }),
      ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
      ...(length !== undefined && { length: length ? parseFloat(length) : null }),
      ...(width !== undefined && { width: width ? parseFloat(width) : null }),
      ...(height !== undefined && { height: height ? parseFloat(height) : null }),
      ...(color !== undefined && { color: color || null })
    });

    // Handle Multiple Product Images (up to 4)
    let existingImagesList = [];
    if (req.body.existing_images) {
      try {
        existingImagesList = typeof req.body.existing_images === 'string' 
          ? JSON.parse(req.body.existing_images) 
          : req.body.existing_images;
      } catch (e) {
        existingImagesList = [];
      }
    }

    if (req.body.existing_images !== undefined) {
      const allCurrent = await ProductImage.findAll({ where: { product_id: product.id } });
      for (const img of allCurrent) {
        if (!existingImagesList.includes(img.image)) {
          await img.destroy();
        }
      }
    }

    if (req.files && req.files.length > 0) {
      const currentCount = await ProductImage.count({ where: { product_id: product.id } });
      for (let i = 0; i < req.files.length && (currentCount + i) < 4; i++) {
        const file = req.files[i];
        await ProductImage.create({
          product_id: product.id,
          image: `/images/products/${file.filename}`,
          is_thumbnail: (currentCount === 0 && i === 0),
          sort_order: currentCount + i
        });
      }
    }

    const remainingImages = await ProductImage.findAll({ where: { product_id: product.id }, order: [['sort_order', 'ASC']] });
    if (remainingImages.length > 0) {
      const hasThumbnail = remainingImages.some(img => img.is_thumbnail);
      if (!hasThumbnail) {
        await remainingImages[0].update({ is_thumbnail: true });
      }
    }

    // Handle Inventory Quantity Update
    if (quantity !== undefined) {
      const newQty = parseInt(quantity) || 0;
      const inventory = await ProductInventory.findOne({ where: { product_id: product.id } });
      if (inventory) {
        await inventory.update({ quantity: newQty });
      } else {
        await ProductInventory.create({ product_id: product.id, quantity: newQty });
      }
    }

    await logActivity(req.user.id, 'EDIT_PRODUCT', `Product details edited for ID ${product.id}`, req);
    return helper.success(res, "Product updated successfully", product, 200);
  } catch (error) {
    console.error("Error updating product:", error);
    return helper.error(res, "Server error updating product", 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) {
      return helper.error(res, "Product not found", 404);
    }
    await product.destroy();
    await logActivity(req.user.id, 'DELETE_PRODUCT', `Product details deleted for ID ${product.id}`, req);
    return helper.success(res, "Product deleted successfully", {}, 200);
  } catch (error) {
    console.error("Error deleting product:", error);
    return helper.error(res, "Server error deleting product", 500);
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) {
      return helper.error(res, "Product not found", 404);
    }

    const oldStatus = product.status;
    let newStatus;
    if (req.body.status !== undefined) {
      newStatus = req.body.status;
      if (!['active', 'inactive'].includes(newStatus)) {
        return helper.error(res, "Invalid status value", 400);
      }
    } else {
      newStatus = oldStatus === 'active' ? 'inactive' : 'active';
    }

    await product.update({ status: newStatus });
    await logActivity(req.user.id, 'UPDATE_PRODUCT_STATUS', `Product status updated from ${oldStatus} to ${newStatus} for product ID ${product.id}`, req);
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
}
