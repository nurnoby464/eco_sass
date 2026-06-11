;
import { 
  IBanner, 
  IBannerDocument, 
  IBannerQueryParams, 
} from '../banner/banner.interface'
import { Types } from 'mongoose';
import { Banner } from './banner.schems';


  
  // Create new banner
  export const createBanner=async(bannerData: Partial<IBanner>): Promise<IBannerDocument>=> {
    const banner = new Banner(bannerData);
    await banner.save();
    return banner;
  }

  // Get all banners with pagination and filtering
 export const  getAllBanners=async(params: IBannerQueryParams)=> {
    const {
      active,
      page = 1,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Build query
    const query: any = {};
    if (active !== undefined) {
      query.active = active === true;
    }

    // Execute queries in parallel
    const [banners, total] = await Promise.all([
      Banner.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Banner.countDocuments(query),
    ]);

    return {
      success: true,
      data: banners,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get active banners for frontend display
 export const getActiveBanners = async (): Promise<IBannerDocument[]> => {
  const now = new Date();
  console.log(now)
  const banners = await Banner.find({
    active: true,
    $and: [
      {
        $or: [
          { startDate: { $lte: now } },
          { startDate: null }
        ]
      },
      {
        $or: [
          { endDate: { $gte: now } },
          { endDate: null }
        ]
      }
    ]
  })
  .sort({ order: 1, createdAt: -1 })
  .lean();

  return banners;
}

  // Get single banner by ID
  export const getBannerById=async(id: string): Promise<IBannerDocument | null>=> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid banner ID');
    }
    
    return await Banner.findById(id).lean();
  }

  // Update banner
  export const updateBanner=async(
    id: string,
    updateData: Partial<IBanner>
  ): Promise<IBannerDocument | null> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid banner ID');
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return banner;
  }

  // Delete banner
export const    deleteBanner=async(id: string): Promise<IBannerDocument | null> =>{
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid banner ID');
    }

    const banner = await Banner.findByIdAndDelete(id).lean();
    
    // Return the banner data so controller can handle Cloudinary cleanup
    return banner;
  }

  // Bulk update banner orders
  export const   bulkUpdateOrders=async(
    updates: Array<{ id: string; order: number; active?: boolean }>
  ): Promise<void>=> {
    const bulkOps = updates.map(({ id, order, active }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order, ...(active !== undefined && { active }) } },
      },
    }));

    await Banner.bulkWrite(bulkOps);
  }

  // Toggle banner active status
export const   toggleBannerStatus=async(id: string): Promise<IBannerDocument | null>=> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid banner ID');
    }

    const banner = await Banner.findById(id);
    if (!banner) return null;

    banner.active = !banner.active;
    await banner.save();
    
    return banner.toJSON();
  }

  // Delete multiple banners
 export const  deleteMultipleBanners= async(ids: string[]): Promise<number> => {
    const validIds = ids.filter(id => Types.ObjectId.isValid(id));
    const result = await Banner.deleteMany({
      _id: { $in: validIds },
    });
    
    return result.deletedCount;
  }


