"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ─── Config ───────────────────────────────────────────────
const MONGO_URI = "mongodb+srv://admin:TREc6lE4TzmrSjithuG@cluster0.m8oaxyu.mongodb.net/emultivendor?retryWrites=true&w=majority&appName=Cluster";
const START_FROM = 12; // nurnoby12
const TOTAL_USERS = 2000;
const MIN_SESSIONS = 3;
const MAX_SESSIONS = 6;
const BATCH_SIZE = 100; // insert in batches to avoid memory spike
// ─── Schemas (inline — no need to import your app schemas) ──
const UserSchema = new mongoose_1.default.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    company_id: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    is_active: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    last_login: { type: Date, default: null },
}, { timestamps: true });
const SessionSchema = new mongoose_1.default.Schema({
    userId: mongoose_1.default.Schema.Types.ObjectId,
    valid: { type: Boolean, default: true },
    user_agent: String,
    ip: String,
}, { timestamps: true });
const User = mongoose_1.default.model("User", UserSchema);
const Session = mongoose_1.default.model("Session", SessionSchema);
// ─── Helpers ──────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "PostmanRuntime/7.51.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36",
];
const IPS = [
    "192.168.1.1", "10.0.0.1", "172.16.0.1",
    "::1", "203.0.113.5", "198.51.100.10",
];
const ROLES = [
    "admin", "account", "site_management",
    "inventory", "sales", "report",
];
// ─── Main ─────────────────────────────────────────────────
const seed = async () => {
    await mongoose_1.default.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    // pre-hash one password — all seed users share the same password
    const hashedPassword = await bcryptjs_1.default.hash("Seed@1234", 12);
    console.log("✅ Password hashed");
    let totalUsersInserted = 0;
    let totalSessionsInserted = 0;
    // ─── Insert in batches ──────────────────────────────────
    for (let batch = 0; batch < Math.ceil(TOTAL_USERS / BATCH_SIZE); batch++) {
        const batchStart = START_FROM + batch * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, START_FROM + TOTAL_USERS);
        // ── build user docs ──
        const userDocs = [];
        for (let i = batchStart; i < batchEnd; i++) {
            userDocs.push({
                _id: new mongoose_1.default.Types.ObjectId(),
                name: `nurnoby${i}`,
                email: `nurnoby${i}@gmail.com`,
                password: hashedPassword,
                role: ROLES[i % ROLES.length], // cycle through roles
                is_active: true,
                company_id: null,
                createdBy: null,
                last_login: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000),
            });
        }
        const insertedUsers = await User.insertMany(userDocs, { ordered: false });
        totalUsersInserted += insertedUsers.length;
        // ── build session docs for this batch ──
        const sessionDocs = [];
        for (const user of insertedUsers) {
            const sessionCount = randomInt(MIN_SESSIONS, MAX_SESSIONS);
            for (let s = 0; s < sessionCount; s++) {
                const isValid = s === 0; // first session is active, rest are old
                sessionDocs.push({
                    userId: user._id,
                    valid: isValid,
                    user_agent: USER_AGENTS[randomInt(0, USER_AGENTS.length - 1)],
                    ip: IPS[randomInt(0, IPS.length - 1)],
                    createdAt: new Date(Date.now() - randomInt(1, 25) * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(Date.now() - randomInt(0, 5) * 24 * 60 * 60 * 1000),
                });
            }
        }
        const insertedSessions = await Session.insertMany(sessionDocs, { ordered: false });
        totalSessionsInserted += insertedSessions.length;
        console.log(`Batch ${batch + 1} done — users: ${totalUsersInserted} | sessions: ${totalSessionsInserted}`);
    }
    console.log("\n─── Seed complete ───────────────────────────");
    console.log(`Total users    : ${totalUsersInserted}`);
    console.log(`Total sessions : ${totalSessionsInserted}`);
    console.log(`Password       : Seed@1234`);
    console.log("─────────────────────────────────────────────");
    await mongoose_1.default.disconnect();
};
seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map