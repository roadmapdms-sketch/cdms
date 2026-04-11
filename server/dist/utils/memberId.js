"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMemberId = generateMemberId;
const crypto_1 = require("crypto");
/**
 * Generates stable-looking member IDs compatible with legacy expectations.
 * Example: mem_a1b2c3d4e5f6
 */
function generateMemberId() {
    return `mem_${(0, crypto_1.randomUUID)().replace(/-/g, '').slice(0, 12)}`;
}
//# sourceMappingURL=memberId.js.map