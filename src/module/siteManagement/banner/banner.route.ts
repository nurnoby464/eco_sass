import { Router } from 'express';
import * as BannerController from '../banner/banner.controller';

import {
  createBannerSchema,
  updateBannerSchema,
  getBannersQuerySchema,
  deleteBannerSchema,
  getBannerSchema,
  bulkUpdateBannersSchema,
  BannerParams,
} from '../banner/banner.validation';
import { validate } from '../../../middlewares/validate';

const router = Router();

// Public routes (no auth required for getting active banners)
router.get('/active', BannerController.getActiveBanners);

// Admin routes (add authentication middleware in production)
router.get(
  '/',
  validate({query:getBannersQuerySchema}),
  BannerController.getAllBanners
);

router.get(
  '/:id',
  validate({params:getBannerSchema}),
  BannerController.getBannerById
);

router.post(
  '/',
  validate({body:createBannerSchema}),
  BannerController.createBanner
);

router.put(
  '/:id',
  validate({params:BannerParams , body:updateBannerSchema}),
  BannerController.updateBanner
);

router.patch(
  '/:id/toggle',
  validate({params:getBannerSchema}),
  BannerController.toggleBannerStatus
);

router.delete(
  '/:id',
  validate({params:deleteBannerSchema}),
  BannerController.deleteBanner
);

router.post(
  '/bulk/update-orders',
  validate({body:bulkUpdateBannersSchema}),
  BannerController.bulkUpdateOrders
);

router.post(
  '/bulk/delete',
  BannerController.deleteMultipleBanners
);

export const BannerRouter = router;