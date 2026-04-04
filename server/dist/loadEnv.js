"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const serverRoot = path_1.default.resolve(__dirname, '..');
function loadIfExists(file, override) {
    const full = path_1.default.join(serverRoot, file);
    if (fs_1.default.existsSync(full)) {
        dotenv_1.default.config({ path: full, override });
    }
}
// Base config, then .env.local wins (Supabase secrets usually live here).
loadIfExists('.env', false);
loadIfExists('.env.local', true);
//# sourceMappingURL=loadEnv.js.map