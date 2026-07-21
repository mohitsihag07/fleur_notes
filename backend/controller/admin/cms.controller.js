const db = require("../../models");
const helper = require("../../helper/helper");
const { Cms, AuditLog } = db;

// Helper to log administrative activities in audit logs table
const logActivity = async (userId, action, description, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      module: 'admin_cms',
      new_values: { description },
      ip_address: req ? (req.ip || req.connection?.remoteAddress) : null
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getCmsPagesList = async (req, res) => {
    try {
        const pages = await Cms.findAll({
            order: [['created_at', 'ASC']]
        });
        return helper.success(res, "Successfully fetched CMS pages", pages, 200);
    } catch (error) {
        console.error("Error fetching CMS pages:", error);
        return helper.error(res, "Server error loading CMS pages", 500);
    }
};

const getCmsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let cmsPage = await Cms.findOne({ where: { slug } });
        
        // Default titles mapping if page doesn't exist yet
        const defaultTitles = {
            'about-us': 'About Us',
            'terms-and-conditions': 'Terms & Conditions',
            'privacy-policy': 'Privacy Policy'
        };

        if (!cmsPage) {
            // Return placeholder object
            return helper.success(res, "CMS Page placeholder", {
                slug,
                title: defaultTitles[slug] || 'CMS Page',
                description: '',
                image: null,
                is_new: true
            }, 200);
        }

        return helper.success(res, "CMS Page details found", cmsPage, 200);
    } catch (error) {
        console.error("Error fetching CMS page by slug:", error);
        return helper.error(res, "Server error fetching CMS page", 500);
    }
};

const updateCmsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, description } = req.body;

        let cmsPage = await Cms.findOne({ where: { slug } });

        let imagePath = cmsPage ? cmsPage.image : null;
        if (req.file) {
            imagePath = `/images/cms/${req.file.filename}`;
        }

        if (!cmsPage) {
            cmsPage = await Cms.create({
                slug,
                title: title || slug,
                description: description || '',
                image: imagePath
            });
        } else {
            await cmsPage.update({
                title: title !== undefined ? title : cmsPage.title,
                description: description !== undefined ? description : cmsPage.description,
                image: imagePath
            });
        }

        await logActivity(req.user.id, 'UPDATE_CMS_PAGE', `CMS page updated for slug: ${slug}`, req);
        return helper.success(res, `CMS page for "${slug}" updated successfully`, cmsPage, 200);
    } catch (error) {
        console.error("Error updating CMS page:", error);
        return helper.error(res, "Server error updating CMS page", 500);
    }
};

module.exports = {
    getCmsPagesList,
    getCmsBySlug,
    updateCmsBySlug
};
