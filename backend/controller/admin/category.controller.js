const { Op } = require("sequelize");
const db = require("../../models");
const helper = require("../../helper/helper");
const { Category, Product, ProductImage, ProductInventory, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_categories',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getCategoriesList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Category.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'DESC']],
      attributes: ['id', 'name', 'slug', 'image', 'description', 'status', 'created_at', 'updated_at'],
    });
    
    await logActivity(req.user.id, 'VIEW_CATEGORIES', 'Categories list viewed', req);
    
    return helper.success(res, `Successfully fetched list of categories`, {
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
        await logActivity(req.user.id, 'VIEW_CATEGORY', `Category details viewed for ID ${req.params.id}`, req);
        return helper.success(res, "Category found", category, 200);
    } catch (error) {
        console.error("Error fetching category:", error);
        return helper.error(res, "Server error loading category", 500);
    }
}

const addCategory = async (req, res) => {
    try {
        const { name, slug, description, status } = req.body;
        if (!name) {
            return helper.error(res, "Category name is required", 400);
        }

        const existingCategory = await Category.findOne({ where: { name } });
        if(existingCategory){
            return helper.error(res, "Category name already exists", 400);
        }

        const finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slugCheck = await Category.findOne({ where: { slug: finalSlug } });
        if (slugCheck) {
            return helper.error(res, "Category slug already exists", 400);
        }

        let imagePath = req.body.image || null;
        if (req.file) {
            imagePath = `/images/categories/${req.file.filename}`;
        }

        const category = await Category.create({
            name,
            slug: finalSlug,
            image: imagePath,
            description: description || '',
            status: status || 'active'
        });
    
        await logActivity(req.user.id, 'ADD_CATEGORY', `Category '${name}' added successfully`, req);
        return helper.success(res, "Category added successfully", category, 200);
    } catch (error) {
        console.error(`Error adding category:`, error);
        return helper.error(res, "Server error adding category", 500);
    }
}

const updateCategory = async (req, res) => {
    try {
        const { name, slug, description, status } = req.body;
        const category = await Category.findOne({ where: { id: req.params.id } });
        if (!category) {
            return helper.error(res, "Category not found", 404);
        }

        if (name) {
            const existingCategory = await Category.findOne({ where: { name, id: { [Op.ne]: req.params.id } } });
            if(existingCategory){
                return helper.error(res, "Category already exists with this name", 400);
            }
        }

        let finalSlug = slug;
        if (name && !slug) {
            finalSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }

        if (finalSlug) {
            const slugCheck = await Category.findOne({ where: { slug: finalSlug, id: { [Op.ne]: req.params.id } } });
            if (slugCheck) {
                return helper.error(res, "Category slug already in use", 400);
            }
        }

        let imagePath = req.body.image !== undefined ? req.body.image : category.image;
        if (req.file) {
            imagePath = `/images/categories/${req.file.filename}`;
        }

        await category.update({
            ...(name && { name }),
            ...(finalSlug && { slug: finalSlug }),
            image: imagePath,
            ...(description !== undefined && { description }),
            ...(status && { status })
        });

        await logActivity(req.user.id, 'EDIT_CATEGORY', `Category '${category.name}' edited successfully`, req);
        return helper.success(res, "Category edited successfully", category, 200);
    } catch (error) {
        console.error(`Error editing category:`, error);
        return helper.error(res, "Server error editing category", 500);
    }
}

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ where: { id: req.params.id } });
        if (!category) {
            return helper.error(res, "Category not found", 404);
        }
        await category.destroy();
        await logActivity(req.user.id, 'DELETE_CATEGORY', `Category deleted with ID ${req.params.id}`, req);
        return helper.success(res, "Category deleted", {}, 200);
    } catch (error) {
        return helper.error(res, "Server error deleting category", 500);
    }
}

const categoryStatusUpdate = async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { id: req.params.id }
        });
        if (!category) {
            return helper.error(res, "Category not found", 404);
        }
        
        const oldStatus = category.status;
        const newStatus = oldStatus === 'active' ? 'inactive' : 'active';
        
        await category.update({
            status: newStatus
        });
        
        await logActivity(req.user.id, 'UPDATE_CATEGORY_STATUS', `Category status updated from ${oldStatus} to ${newStatus} for category ID ${category.id}`, req);
        return helper.success(res, "Category status updated successfully", category);
    } catch (error) {
        console.error("Error updating category status:", error);
        return helper.error(res, "Failed to update category status", 500);
    }
}

module.exports = {
    getCategoriesList,
    getCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    categoryStatusUpdate
}