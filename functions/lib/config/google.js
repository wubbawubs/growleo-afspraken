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
exports.oauth2Client = void 0;
exports.initializeOAuth2Client = initializeOAuth2Client;
const google_auth_library_1 = require("google-auth-library");
const settings_1 = require("../calendar/settings");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error('Missing required Google OAuth environment variables');
}
// Initialize OAuth2 client
exports.oauth2Client = new google_auth_library_1.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});
// Setup token refresh handler
exports.oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
        const expiryDate = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000));
        await (0, settings_1.updateCalendarToken)(tokens.access_token, expiryDate);
    }
});
// Initialize tokens from Firestore
async function initializeOAuth2Client() {
    const settings = await (0, settings_1.getCalendarOAuthSettings)();
    if (settings) {
        exports.oauth2Client.setCredentials({
            access_token: settings.accessToken,
            refresh_token: settings.refreshToken,
            expiry_date: settings.expiryDate.toDate().getTime()
        });
    }
}
//# sourceMappingURL=google.js.map