export async function fetchCodes() {
    const url = `https://opensheet.elk.sh/1jwcgoSKnSbu_V2dg8Fjo6XHqZD4CY-Hbq1z3dliDLmc/river-codes`;
    const res = await fetch(url);
    const json = await res.json(); // no regex needed

    const codes = {};
    for (const row of json) {
        const code = row["Code"];
        const msg = row["Message"];
        if (code && msg) {
            codes[code] = msg;
        }
    }

    return codes;
}