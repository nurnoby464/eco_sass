import { Request, Response } from 'express';
import * as BannerService from '../banner/banner.service';
import { IBannerQueryParams } from './banner.interface';

// Create new banner
export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const banner = await BannerService.createBanner(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create banner',
    });
  }
}

// Get all banners (admin)
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active, page, limit, sortBy, sortOrder } = req.query;
    
    // Build params object only with defined values
    const params: IBannerQueryParams = {};
    
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
      params.sortBy = sortBy as string;
    }
    
    if (sortOrder !== undefined) {
      params.sortOrder = sortOrder as 'asc' | 'desc';
    }
    
    const result = await BannerService.getAllBanners(params);
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banners',
    });
  }
}

// Get active banners for frontend
export const getActiveBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await BannerService.getActiveBanners();
    
    res.status(200).json({
      success: true,
      data: banners,
      count: banners.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch active banners',
    });
  }
}

// Get single banner
export const getBannerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await BannerService.getBannerById(id as string);
    
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banner',
    });
  }
}

// Update banner
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await BannerService.updateBanner(id as string, req.body);
    
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update banner',
    });
  }
}

// Delete banner
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await BannerService.deleteBanner(id as string);
    
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete banner',
    });
  }
}

// Toggle banner status
export const toggleBannerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await BannerService.toggleBannerStatus(id as string);
    
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle banner status',
    });
  }
}

// Bulk update banner orders
export const bulkUpdateOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { banners } = req.body;
    await BannerService.bulkUpdateOrders(banners);
    
    res.status(200).json({
      success: true,
      message: 'Banner orders updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update banner orders',
    });
  }
}

// Delete multiple banners
export const deleteMultipleBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    const deletedCount = await BannerService.deleteMultipleBanners(ids);
    
    res.status(200).json({
      success: true,
      message: `${deletedCount} banner(s) deleted successfully`,
      data: { deletedCount },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete banners',
    });
  }
}