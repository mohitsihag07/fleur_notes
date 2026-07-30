const db = require("../../models");
const helper = require("../../helper/helper");
const { Category, Product, ProductImage, ProductInventory } = db;

const getCategoriesList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'active';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { slug: { $regex: search, $options: 'i' } }];
    if (status) query.status = status;

    const [rows, count] = await Promise.all([
      Category.find(query).sort({ sort_order: 1, _id: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Category.countDocuments(query)
    ]);

    return helper.success(res, 'Successfully fetched list of categories', {
      categories: rows,
      data: rows,
      meta: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, limit }
    });
  } catch (e) { return helper.error(res, 'Server error loading categories', 500); }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean({ virtuals: true });
    if (!category) return helper.error(res, "Category not found", 404);

    const products = await Product.find({ category_id: category._id, status: 'active' }, 'id name slug price sale_price status created_at').lean({ virtuals: true });
    const productIds = products.map(p => p._id);
    const [images, inventories] = await Promise.all([
      ProductImage.find({ product_id: { $in: productIds } }, 'id image is_thumbnail sort_order product_id').lean({ virtuals: true }),
      ProductInventory.find({ product_id: { $in: productIds } }, 'quantity reserved_quantity product_id').lean({ virtuals: true })
    ]);

    const productsWithData = products.map(p => ({
      ...p,
      images: images.filter(img => String(img.product_id) === String(p._id)),
      inventory: inventories.find(inv => String(inv.product_id) === String(p._id)) || null
    }));

    return helper.success(res, "Category found", { ...category, products: productsWithData }, 200);
  } catch (e) { return helper.error(res, "Server error loading category", 500); }
};

module.exports = { getCategoriesList, getCategory };