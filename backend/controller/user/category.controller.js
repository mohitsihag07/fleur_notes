const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Category, Product, ProductImage, ProductInventory } = db;



const getCategoriesList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'active';
    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Category.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['sort_order', 'ASC'], ['id', 'DESC']],
      attributes: ['id', 'name', 'slug', 'image', 'description', 'status', 'created_at', 'updated_at'],
    });

    return helper.success(res, `Successfully fetched list of categories`, {
      categories: rows,
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error(`Error loading categories:`, error);
    return helper.error(res, 'Server error loading categories', 500);
  }
}; 

const getCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'name', 'slug', 'image', 'description', 'status', 'created_at', 'updated_at'],
            include: [
                {
                    model: Product,
                    as: 'products',
                    required: false,
                    attributes: ['id', 'name', 'slug', 'price', 'sale_price', 'status', 'created_at'],
                    include: [
                        {
                            model: ProductImage,
                            as: 'images',
                            required: false,
                            attributes: ['id', 'image', 'is_thumbnail']
                        },
                        {
                            model: ProductInventory,
                            as: 'inventory',
                            required: false,
                            attributes: ['quantity', 'reserved_quantity']
                        }
                    ]
                }
            ]
        });
        if (!category) {
            return helper.error(res, "Category not found", 404);
        }
        return helper.success(res, "Category found", category, 200);
    } catch (error) {
        console.error("Error fetching category:", error);
        return helper.error(res, "Server error loading category", 500);
    }
}


module.exports = {
    getCategoriesList,
    getCategory
}