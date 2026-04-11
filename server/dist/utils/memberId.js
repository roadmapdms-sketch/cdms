"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMBER_ID_LENGTH = void 0;
exports.generateMemberId = generateMemberId;
const crypto_1 = require("crypto");
const PREFIX = 'mem_';
/** Total length including prefix (prefix + 21 hex digits). */
exports.MEMBER_ID_LENGTH = 25;
/**
 * Generates opaque member IDs: fixed 25 characters (`mem_` + 21 hex).
 */
function generateMemberId() {
    const suffixLen = exports.MEMBER_ID_LENGTH - PREFIX.length;
    const hex = (0, crypto_1.randomBytes)(Math.ceil(suffixLen / 2))
        .toString('hex')
        .slice(0, suffixLen);
    return `${PREFIX}${hex}`;
}
//# sourceMappingURL=memberId.js.map