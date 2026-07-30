const db = require("../../models");
const helper = require("../../helper/helper");
const { Category, Product, ProductImage, ProductInventory, AuditLog } = db;

const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({ user_id: userId, action, module: 'admin_categories', new_values: { description }, ip_address: req ? (req.ip || req.connection?.remoteAddress) : null });
  } catch (e) { console.error("Failed to log activity:", e); }
};

const getCategoriesList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { slug: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;

    const [rows, count, totalCategories, activeCategories, inactiveCategories, totalProducts] = await Promise.all([
      Category.find(query).sort({ _id: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Category.countDocuments(query),
      Category.countDocuments(),
      Category.countDocuments({ status: 'active' }),
      Category.countDocuments({ status: 'inactive' }),
      Product.countDocuments()
    ]);

    const rowsWithId = rows.map(cat => ({
      ...cat,
      id: cat._id
    }));

    await logActivity(req.user._id, 'VIEW_CATEGORIES', 'Categories list viewed', req);
    return helper.success(res, 'Successfully fetched list of categories', {
      data: rowsWithId,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit, stats: { totalCategories, activeCategories, inactiveCategories, totalProducts } }
    });
  } catch (e) { console.error('Error loading categories:', e); return helper.error(res, 'Server error loading categories', 500); }
};

const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined' || id === 'null') {
      return helper.error(res, "Invalid category ID specified", 400);
    }

    const mongoose = require('mongoose');
    let category = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      category = await Category.findById(id).lean({ virtuals: true });
    }

    if (!category) {
      category = await Category.findOne({ slug: id }).lean({ virtuals: true });
    }

    if (!category) return helper.error(res, "Category not found", 404);

    const products = await Product.find({ category_id: category._id }, 'id name slug price sale_price status created_at').lean({ virtuals: true });
    const productIds = products.map(p => p._id);
    const [images, inventories] = await Promise.all([
      ProductImage.find({ product_id: { $in: productIds } }, 'id image is_thumbnail product_id').lean({ virtuals: true }),
      ProductInventory.find({ product_id: { $in: productIds } }, 'quantity reserved_quantity product_id').lean({ virtuals: true })
    ]);

    const productsWithData = products.map(p => ({
      ...p,
      id: p._id,
      images: images.filter(img => String(img.product_id) === String(p._id)),
      inventory: inventories.find(inv => String(inv.product_id) === String(p._id)) || null
    }));

    if (req.user) await logActivity(req.user._id, 'VIEW_CATEGORY', `Category details viewed for ID ${id}`, req);
    return helper.success(res, "Category found", { ...category, id: category._id, products: productsWithData }, 200);
  } catch (e) { console.error("Error fetching category:", e); return helper.error(res, "Server error loading category", 500); }
};

const addCategory = async (req, res) => {
  try {
    const { name, slug, description, status } = req.body;
    if (!name) return helper.error(res, "Category name is required", 400);

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) return helper.error(res, "Category name already exists", 400);

    const finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slugCheck = await Category.findOne({ slug: finalSlug });
    if (slugCheck) return helper.error(res, "Category slug already exists", 400);

    let imagePath = req.body.image || null;
    if (req.file) imagePath = `/images/categories/${req.file.filename}`;

    const category = await Category.create({ name, slug: finalSlug, image: imagePath, description: description || '', status: status || 'active' });
    await logActivity(req.user._id, 'ADD_CATEGORY', `Category '${name}' added successfully`, req);
    return helper.success(res, "Category added successfully", category, 200);
  } catch (e) { console.error('Error adding category:', e); return helper.error(res, "Server error adding category", 500); }
};

const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, status } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return helper.error(res, "Category not found", 404);

    if (name) {
      const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (existingCategory) return helper.error(res, "Category already exists with this name", 400);
    }

    let finalSlug = slug;
    if (name && !slug) finalSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (finalSlug) {
      const slugCheck = await Category.findOne({ slug: finalSlug, _id: { $ne: req.params.id } });
      if (slugCheck) return helper.error(res, "Category slug already in use", 400);
    }

    let imagePath = req.body.image !== undefined ? req.body.image : category.image;
    if (req.file) imagePath = `/images/categories/${req.file.filename}`;

    if (name) category.name = name;
    if (finalSlug) category.slug = finalSlug;
    category.image = imagePath;
    if (description !== undefined) category.description = description;
    if (status) category.status = status;
    await category.save();

    await logActivity(req.user._id, 'EDIT_CATEGORY', `Category '${category.name}' edited`, req);
    return helper.success(res, "Category edited successfully", category, 200);
  } catch (e) { console.error('Error editing category:', e); return helper.error(res, "Server error editing category", 500); }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return helper.error(res, "Category not found", 404);
    await Category.findByIdAndDelete(req.params.id);
    await logActivity(req.user._id, 'DELETE_CATEGORY', `Category deleted with ID ${req.params.id}`, req);
    return helper.success(res, "Category deleted", {}, 200);
  } catch (e) { return helper.error(res, "Server error deleting category", 500); }
};

const categoryStatusUpdate = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return helper.error(res, "Category not found", 404);
    const oldStatus = category.status;
    category.status = oldStatus === 'active' ? 'inactive' : 'active';
    await category.save();
    await logActivity(req.user._id, 'UPDATE_CATEGORY_STATUS', `Category status updated from ${oldStatus} to ${category.status}`, req);
    return helper.success(res, "Category status updated successfully", category);
  } catch (e) { return helper.error(res, "Failed to update category status", 500); }
};

module.exports = { getCategoriesList, getCategory, addCategory, updateCategory, deleteCategory, categoryStatusUpdate };