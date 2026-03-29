import { Types } from "mongoose";
import Session from "../module/auth/auth.schema";
const MAX_SESSIONS = 5;

export const enforceSessionLimit = async (userId: Types.ObjectId) => {
  //   const count = await Session.countDocuments({ userId, valid: true });
  //   console.log(count);
  const sessions = await Session.find({ userId, valid: true })
    .sort({ updatedAt: 1 }) // oldest first
    .select("_id");
  if (MAX_SESSIONS < sessions.length) {
    const toDelete = sessions.slice(0, sessions.length - 1).map((s) => s._id);
    await Session.deleteMany({ _id: { $in: toDelete } });
  }
  console.log(sessions)
};
