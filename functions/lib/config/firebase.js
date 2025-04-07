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
exports.db = exports.admin = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const path = __importStar(require("path"));
// Gebruik een relatief pad vanaf de functions directory
const serviceAccountPath = path.resolve(__dirname, '../../../growleo-afspraken-909155e896e5.json');
console.log('Loading service account from:', serviceAccountPath);
try {
    // Initialiseer Firebase Admin als het nog niet is geïnitialiseerd
    if (!admin.apps.length) {
        // Configure to use auth emulator in development
        if (process.env.FUNCTIONS_EMULATOR) {
            process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
            console.log('🔧 Using Auth Emulator at localhost:9099');
        }
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
            databaseURL: 'https://growleo-afspraken.firebaseio.com'
        });
        console.log('Firebase Admin initialized successfully');
    }
}
catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
}
// Initialiseer Firestore
const db = admin.firestore();
exports.db = db;
// Stel de regio in voor betere prestaties
db.settings({
    ignoreUndefinedProperties: true
});
//# sourceMappingURL=firebase.js.map