export async function fetchCodes() {
    const url = `https://opensheet.elk.sh/1jwcgoSKnSbu_V2dg8Fjo6XHqZD4CY-Hbq1z3dliDLmc/river-codes`;
    const res = await fetch(url);
    const json = await res.json();

    const codes = {};

    for (const row of json) {
        const code = row["Code"]?.trim();
        const message = row["Message"]?.trim();
        const numStr = row["Num"]?.trim();
        const buttonIndex = parseInt(numStr, 10) - 1;

        if (code && message && !isNaN(buttonIndex) && buttonIndex >= 0) {
            codes[code] = {
                message,
                buttonIndex
            };
        }
    }

    return codes;
}
