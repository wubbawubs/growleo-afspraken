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
exports.verifyAuth = verifyAuth;
exports.verifyAdmin = verifyAdmin;
const admin = __importStar(require("firebase-admin"));
// 2. Update function signature to use AuthRequest
async function verifyAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            res.status(401).json({ error: 'No token provided' });
            return; // Add explicit return
        }
        const token = authHeader.split('Bearer ')[1];
        // Verify token met de juiste projectId
        const decodedToken = await admin.auth().verifyIdToken(token);
        // Now TypeScript knows req.user exists
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Auth verification failed:', error);
        res.status(401).json({ error: 'Unauthorized' });
        return; // Add explicit return
    }
}
async function verifyAdmin(req, res, next) {
    console.log('👑 === ADMIN CHECK START ===');
    const user = req.user;
    if (!user) {
        console.log('❌ No user found in request');
        res.status(401).json({ error: 'No authentication token provided' });
        return;
    }
    console.log('👤 User role:', user.role);
    if (user.role !== 'admin') {
        console.log('🚫 User is not admin');
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    console.log('✅ Admin check passed');
    next();
}
//# sourceMappingURL=middleware.js.map