const db = require("../../models");
const helper = require("../../helper/helper");
const { Product, Category, ProductImage, ProductInventory, Review, User } = db;

const attachProductData = async (products) => {
  const productIds = products.map(p => p._id);
  const [images, inventories] = await Promise.all([
    ProductImage.find({ product_id: { $in: productIds } }, 'id image is_thumbnail sort_order product_id').lean({ virtuals: true }),
    ProductInventory.find({ product_id: { $in: productIds } }, 'quantity reserved_quantity product_id').lean({ virtuals: true })
  ]);
  return products.map(p => ({
    ...p,
    category: p.category_id,
    images: images.filter(img => String(img.product_id) === String(p._id)),
    inventory: inventories.find(inv => String(inv.product_id) === String(p._id)) || null
  }));
};

const featuredProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', is_featured: true }).populate('category_id', 'id name slug').sort({ _id: -1 }).limit(10).lean({ virtuals: true });
    return helper.success(res, "Featured products fetched successfully", await attachProductData(products), 200);
  } catch (e) { return helper.error(res, "Server error fetching featured products", 500); }
};

const newProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', is_new_arrival: true }).populate('category_id', 'id name slug').sort({ _id: -1 }).limit(10).lean({ virtuals: true });
    return helper.success(res, "New products fetched successfully", await attachProductData(products), 200);
  } catch (e) { return helper.error(res, "Server error fetching new products", 500); }
};

const bestsellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', is_best_seller: true }).populate('category_id', 'id name slug').sort({ _id: -1 }).limit(10).lean({ virtuals: true });
    return helper.success(res, "Bestseller products fetched successfully", await attachProductData(products), 200);
  } catch (e) { return helper.error(res, "Server error fetching bestseller products", 500); }
};

const getProductsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'active';
    const category_id = req.query.category_id || '';
    const category_slug = req.query.category || req.query.category_slug || '';
    const type = req.query.type || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { slug: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];

    if (category_id) {
      query.category_id = category_id;
    } else if (category_slug && category_slug !== 'all') {
      const cat = await Category.findOne({
        $or: [
          { slug: category_slug },
          { name: { $regex: `^${category_slug}$`, $options: 'i' } }
        ]
      });
      if (cat) {
        query.category_id = cat._id;
      }
    }

    const filterParam = req.query.filter || req.query.type;
    if (filterParam) {
      if (filterParam === 'featured') query.is_featured = true;
      if (['new-arrivals', 'new', 'new_arrival'].includes(filterParam)) query.is_new_arrival = true;
      if (['bestsellers', 'bestseller', 'best-sellers', 'best_seller'].includes(filterParam)) query.is_best_seller = true;
    }

    const [rows, count, totalProducts, activeProducts, inactiveProducts, lowStockProducts] = await Promise.all([
      Product.find(query).populate('category_id', 'id name slug').sort({ _id: -1 }).skip(skip).limit(limit).lean({ virtuals: true }),
      Product.countDocuments(query),
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'inactive' }),
      ProductInventory.countDocuments({ quantity: { $lte: 5 } })
    ]);

    const rowsWithData = await attachProductData(rows);
    return helper.success(res, 'Successfully fetched list of products', {
      data: rowsWithData,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit) || 1,
        currentPage: page,
        limit,
        stats: { totalProducts, activeProducts, inactiveProducts, lowStockProducts }
      }
    });
  } catch (e) {
    console.error("Error loading products:", e);
    return helper.error(res, 'Server error loading products', 500);
  }
};

const getProduct = async (req, res) => {
  try {
    const identifier = req.params.id;
    // Try ObjectId first, then slug
    let product = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).populate('category_id', 'id name slug').lean({ virtuals: true });
    }
    if (!product) {
      product = await Product.findOne({ slug: identifier }).populate('category_id', 'id name slug').lean({ virtuals: true });
    }
    if (!product) return helper.error(res, "Product not found", 404);

    const [images, inventory, reviews] = await Promise.all([
      ProductImage.find({ product_id: product._id }).lean({ virtuals: true }),
      ProductInventory.findOne({ product_id: product._id }).lean({ virtuals: true }),
      Review.find({ product_id: product._id }, 'id rating review images status admin_reply created_at').populate('user_id', 'id name email').lean({ virtuals: true })
    ]);

    const reviewsWithUser = reviews.map(r => ({ ...r, user: r.user_id }));
    return helper.success(res, "Product found", { ...product, category: product.category_id, images, inventory, reviews: reviewsWithUser }, 200);
  } catch (e) { console.error("Error loading product:", e); return helper.error(res, "Server error loading product", 500); }
};

module.exports = { featuredProducts, bestsellerProducts, newProducts, getProductsList, getProduct };
