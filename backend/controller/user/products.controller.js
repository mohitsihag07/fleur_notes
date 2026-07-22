const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Product, Category, ProductImage, ProductInventory, ProductTag, Review, User, AuditLog } = db;


const featuredProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { status: 'active', is_featured: true },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: ProductImage, as: 'images', required: false, attributes: ['id', 'image', 'is_thumbnail', 'sort_order'] },
                { model: ProductInventory, as: 'inventory', required: false, attributes: ['quantity', 'reserved_quantity'] }
            ],
            limit: 10,
            order: [['id', 'DESC']]
        });
        return helper.success(res, "Featured products fetched successfully", products, 200);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return helper.error(res, "Server error fetching featured products", 500);
    }
}

const newProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { status: 'active', is_new_arrival: true },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: ProductImage, as: 'images', required: false, attributes: ['id', 'image', 'is_thumbnail', 'sort_order'] },
                { model: ProductInventory, as: 'inventory', required: false, attributes: ['quantity', 'reserved_quantity'] }
            ],
            limit: 10,
            order: [['id', 'DESC']]
        });
        return helper.success(res, "New products fetched successfully", products, 200);
    } catch (error) {
        console.error("Error fetching new products:", error);
        return helper.error(res, "Server error fetching new products", 500);
    }
}

const bestsellerProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { status: 'active', is_best_seller: true },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: ProductImage, as: 'images', required: false, attributes: ['id', 'image', 'is_thumbnail', 'sort_order'] },
                { model: ProductInventory, as: 'inventory', required: false, attributes: ['quantity', 'reserved_quantity'] }
            ],
            limit: 10,
            order: [['id', 'DESC']]
        });
        return helper.success(res, "Bestseller products fetched successfully", products, 200);
    } catch (error) {
        console.error("Error fetching bestseller products:", error);
        return helper.error(res, "Server error fetching bestseller products", 500);
    }
}

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
        const identifier = req.params.id;
        const isNumeric = !isNaN(identifier) && !isNaN(parseFloat(identifier));

        const whereClause = isNumeric
          ? { [Op.or]: [{ id: parseInt(identifier) }, { slug: identifier }] }
          : { slug: identifier };

        const product = await Product.findOne({
            where: whereClause,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
                { model: ProductImage, as: 'images', required: false, attributes: ['id', 'image', 'is_thumbnail', 'sort_order'] },
                { model: ProductInventory, as: 'inventory', required: false, attributes: ['quantity', 'reserved_quantity'] },
                {
                  model: Review,
                  as: 'reviews',
                  required: false,
                  attributes: ['id', 'rating', 'review', 'images', 'status', 'admin_reply', 'created_at'],
                  include: [
                    { model: User, as: 'user', required: false, attributes: ['id', 'name', 'email'] }
                  ]
                }
            ]
        });
        if (!product) {
            return helper.error(res, "Product not found", 404);
        }
        if (req.user) {
            await logActivity(req.user.id, 'VIEW_PRODUCT', `Product details viewed for ${req.params.id}`, req);
        }
        return helper.success(res, "Product found", product, 200);
    } catch (error) {
        console.error("Error loading product:", error);
        return helper.error(res, "Server error loading product", 500);
    }
};

module.exports = {
    featuredProducts,
    bestsellerProducts,
    newProducts,
    getProductsList,
    getProduct
}
