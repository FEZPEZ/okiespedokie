export async function fetchCodes() {
    const url = `https://opensheet.elk.sh/1jwcgoSKnSbu_V2dg8Fjo6XHqZD4CY-Hbq1z3dliDLmc/river-codes`;
    const res = await fetch(url);
    const json = await res.json();

    const codes = {};
    let circleUnlock = null;

    for (const row of json) {
        const numStr = row["Num"]?.trim();
        const code = row["Code"]?.trim();
        const message = row["Message"]?.trim();
        const circleCode = row["CircleCode"]?.trim();
        const circleMessage = row["CircleMessage"]?.trim();

        const buttonIndex = parseInt(numStr, 10) - 1;

        // Handle standard keypad code
        if (code && message && !isNaN(buttonIndex) && buttonIndex >= 0) {
            codes[code] = {
                message,
                buttonIndex
            };
        }

        // Handle circle unlock sequence
        if (circleCode && circleMessage && !circleUnlock) {
            // Example: circleCode = "132342"
            const sequence = circleCode.split("").map(n => parseInt(n, 10) - 1);
            const validSequence = sequence.every(i => !isNaN(i) && i >= 0 && i < 4);
            if (validSequence && sequence.length >= 4) {
                circleUnlock = {
                    sequence,
                    message: circleMessage
                };
            }
        }
    }

    return {
        codes,
        circleUnlock
    };
}
