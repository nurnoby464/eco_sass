import mongoose from 'mongoose';

interface MongoCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoCache: MongoCache | undefined;
}

const cache: MongoCache = global._mongoCache ?? {
  conn: null,
  promise: null,
};

global._mongoCache = cache;

const connectDB = async (): Promise<mongoose.Connection> => {
  if (!process.env.MONGO_URI) {
    throw new Error('[DB] MONGO_URI is not defined');
  }

  // ✅ Ensure active connection
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DB] Connected: ${mongooseInstance.connection.host}`);
        }
        return mongooseInstance.connection;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
};

export default connectDB;