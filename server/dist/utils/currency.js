"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZAR = formatZAR;
/** South African Rand — API strings (en-ZA locale). */
function formatZAR(amount, opts) {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: opts?.minimumFractionDigits ?? 0,
        maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
    }).format(amount);
}
//# sourceMappingURL=currency.js.map