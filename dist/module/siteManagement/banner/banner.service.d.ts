import { IBanner, IBannerDocument, IBannerQueryParams } from '../banner/banner.interface';
import { Types } from 'mongoose';
export declare const createBanner: (bannerData: Partial<IBanner>) => Promise<IBannerDocument>;
export declare const getAllBanners: (params: IBannerQueryParams) => Promise<{
    success: boolean;
    data: (IBannerDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>;
export declare const getActiveBanners: () => Promise<IBannerDocument[]>;
export declare const getBannerById: (id: string) => Promise<IBannerDocument | null>;
export declare const updateBanner: (id: string, updateData: Partial<IBanner>) => Promise<IBannerDocument | null>;
export declare const deleteBanner: (id: string) => Promise<IBannerDocument | null>;
export declare const bulkUpdateOrders: (updates: Array<{
    id: string;
    order: number;
    active?: boolean;
}>) => Promise<void>;
export declare const toggleBannerStatus: (id: string) => Promise<IBannerDocument | null>;
export declare const deleteMultipleBanners: (ids: string[]) => Promise<number>;
//# sourceMappingURL=banner.service.d.ts.map