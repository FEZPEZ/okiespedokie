export async function fetchCodes(sheetId, sheetName = "Sheet1") {
    const url = `https://opensheet.elk.sh/1jwcgoSKnSbu_V2dg8Fjo6XHqZD4CY-Hbq1z3dliDLmc/river-codes`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const codes = {};
        for (const row of data) {
            if (row.Code && row.Message) {
                codes[row.Code.trim()] = row.Message.trim();
            }
        }
        return codes;
    } catch (err) {
        console.error("Failed to load codes from sheet:", err);
        return {};
    }
}
