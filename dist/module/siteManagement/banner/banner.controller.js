"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleBanners = exports.bulkUpdateOrders = exports.toggleBannerStatus = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getActiveBanners = exports.getAllBanners = exports.createBanner = void 0;
const BannerService = __importStar(require("../banner/banner.service"));
// Create new banner
const createBanner = async (req, res) => {
    try {
        const banner = await BannerService.createBanner(req.body);
        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: banner,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create banner',
        });
    }
};
exports.createBanner = createBanner;
// Get all banners (admin)
const getAllBanners = async (req, res) => {
    try {
        const { active, page, limit, sortBy, sortOrder } = req.query;
        // Build params object only with defined values
        const params = {};
        if (active !== undefined) {
            params.active = active === 'true';
        }
        if (page !== undefined) {
            params.page = Number(page);
        }
        if (limit !== undefined) {
            params.limit = Number(limit);
        }
        if (sortBy !== undefined) {
            params.sortBy = sortBy;
        }
        if (sortOrder !== undefined) {
            params.sortOrder = sortOrder;
        }
        const result = await BannerService.getAllBanners(params);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch banners',
        });
    }
};
exports.getAllBanners = getAllBanners;
// Get active banners for frontend
const getActiveBanners = async (req, res) => {
    try {
        const banners = await BannerService.getActiveBanners();
        res.status(200).json({
            success: true,
            data: banners,
            count: banners.length,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch active banners',
        });
    }
};
exports.getActiveBanners = getActiveBanners;
// Get single banner
const getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await BannerService.getBannerById(id);
        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: banner,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch banner',
        });
    }
};
exports.getBannerById = getBannerById;
// Update banner
const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await BannerService.updateBanner(id, req.body);
        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: banner,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update banner',
        });
    }
};
exports.updateBanner = updateBanner;
// Delete banner
const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await BannerService.deleteBanner(id);
        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
            return;
        }
        // Note: Cloudinary cleanup should be handled by frontend or separate service
        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
            data: { imagePublicId: banner.imagePublicId }, // Send back for cleanup
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete banner',
        });
    }
};
exports.deleteBanner = deleteBanner;
// Toggle banner status
const toggleBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await BannerService.toggleBannerStatus(id);
        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `Banner ${banner.active ? 'activated' : 'deactivated'} successfully`,
            data: banner,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to toggle banner status',
        });
    }
};
exports.toggleBannerStatus = toggleBannerStatus;
// Bulk update banner orders
const bulkUpdateOrders = async (req, res) => {
    try {
        const { banners } = req.body;
        await BannerService.bulkUpdateOrders(banners);
        res.status(200).json({
            success: true,
            message: 'Banner orders updated successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update banner orders',
        });
    }
};
exports.bulkUpdateOrders = bulkUpdateOrders;
// Delete multiple banners
const deleteMultipleBanners = async (req, res) => {
    try {
        const { ids } = req.body;
        const deletedCount = await BannerService.deleteMultipleBanners(ids);
        res.status(200).json({
            success: true,
            message: `${deletedCount} banner(s) deleted successfully`,
            data: { deletedCount },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete banners',
        });
    }
};
exports.deleteMultipleBanners = deleteMultipleBanners;
//# sourceMappingURL=banner.controller.js.map