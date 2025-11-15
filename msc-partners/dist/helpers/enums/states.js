"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UF = void 0;
exports.getUFs = getUFs;
var UF;
(function (UF) {
    UF[UF["AC"] = 12] = "AC";
    UF[UF["AL"] = 27] = "AL";
    UF[UF["AM"] = 13] = "AM";
    UF[UF["AP"] = 16] = "AP";
    UF[UF["BA"] = 29] = "BA";
    UF[UF["CE"] = 23] = "CE";
    UF[UF["DF"] = 53] = "DF";
    UF[UF["ES"] = 32] = "ES";
    UF[UF["GO"] = 52] = "GO";
    UF[UF["MA"] = 21] = "MA";
    UF[UF["MG"] = 31] = "MG";
    UF[UF["MS"] = 50] = "MS";
    UF[UF["MT"] = 51] = "MT";
    UF[UF["PA"] = 15] = "PA";
    UF[UF["PB"] = 25] = "PB";
    UF[UF["PE"] = 26] = "PE";
    UF[UF["PI"] = 22] = "PI";
    UF[UF["PR"] = 41] = "PR";
    UF[UF["RJ"] = 33] = "RJ";
    UF[UF["RN"] = 24] = "RN";
    UF[UF["RO"] = 11] = "RO";
    UF[UF["RR"] = 14] = "RR";
    UF[UF["RS"] = 43] = "RS";
    UF[UF["SC"] = 42] = "SC";
    UF[UF["SE"] = 28] = "SE";
    UF[UF["SP"] = 35] = "SP";
    UF[UF["TO"] = 17] = "TO"; // Tocantins
})(UF || (exports.UF = UF = {}));
function getUFs() {
    return Object.entries(UF)
        .filter(([key, value]) => isNaN(Number(key)))
        .map(([key, value]) => ({
        Id: value,
        Sigla: key
    }));
}
