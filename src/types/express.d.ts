import { IUserDocument } from '../models/super_admin.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}