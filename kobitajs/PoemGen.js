let db = {};
const DB_FILE_PATH = "kobitajs/db.json";
const BRAIN_ELEMENT_ID = "brain";
const KOBITA_ELEMENT_ID = "kobita";

function getOptions(p) {
    if (p.length < 2) {
        return p;
    }
    let pp = '';
    let str;
    let chr;
    let chr2;
    let option;
    let i, j;

    for (i = 0; i < p.length; i++) {
        chr = p.charAt(i);
        if (chr === '[') {
            option = 1;
            str = '';            
            for (j = i + 1; j < p.length; j++) {
                chr2 = p.charAt(j);
                if (chr2 === ']') {
                    option--;
                    if (option === 0) {
                        break;
                    }
                } else if (chr2 === '[') {
                    option++;
                }
            }

            if (option === 0) {                
                str = p.substring(i + 1, j);
                i = j;
            } else {                
                console.error("Error in options parsing: Unmatched brackets.");
                throw new Error("Options parsing error: Unmatched brackets in pattern.");
            }
            pp += (random(2) === 1) ? getOptions(str) : '';
        } else {
            pp += chr;
        }
    }
    
    return pp;
}

async function init() {
    try {
        const response = await fetch(DB_FILE_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        db = await response.json();
        start();
    } catch (error) {
        console.error("Failed to load database:", error);
    }
}

function start() {
    const brainElement = document.getElementById(BRAIN_ELEMENT_ID);
    if (brainElement) {
        brainElement.value = JSON.stringify(db, null, 4);
    }
    make_poem();
}

function random(maxnum) {
    if (maxnum <= 0) return 0;
    const r = Math.floor(Math.random() * maxnum);
    return r;
}

function make_poem() {
    const kobitaElement = document.getElementById(KOBITA_ELEMENT_ID);
    const brainElement = document.getElementById(BRAIN_ELEMENT_ID);

    if (kobitaElement) {
        kobitaElement.innerHTML = '';
    }
    
    if (brainElement) {
        const new_db_text = brainElement.value;
        try {
            db = JSON.parse(new_db_text);
        } catch (e) {
            console.error("Invalid JSON in brain editor:", e);
            alert("Error: The text in the 'brain' editor is not valid JSON.");
            return;
        }
    }

    const nlines = random(4) + 1;
    for (let ilin = 1; ilin <= nlines; ilin++) {
        make_poem_line();
    }
}

function make_poem_line() {
    if (!db.rules || !db.dict || db.rules.length === 0) {
        console.error("Database structure (rules/dict) is missing or empty.");
        return;
    }

    try {
        const pattern_group_index = random(db.rules.length);
        const pattern_group = db.rules[pattern_group_index];
        const pattern_index = random(pattern_group.values.length);
        let pattern = getOptions(pattern_group.values[pattern_index]);

        const lenpat = pattern.length;
        let number = 0;
        let line = '';

        for (let ichr = 0; ichr < lenpat; ichr++) {
            const chr = pattern.charAt(ichr);

            if (chr === '{') {
                number = 0;
            } else if (chr === '}') {
                if (number > 0 && db.dict[number - 1] && db.dict[number - 1].values && db.dict[number - 1].values.length > 0) {
                    const dict_index = random(db.dict[number - 1].values.length);
                    const wrd = db.dict[number - 1].values[dict_index];
                    line += wrd;
                } else {
                    console.warn(`Missing dictionary entry for number: ${number}`);
                    line += `{#${number}#}`;
                }
            } else if (chr >= '0' && chr <= '9') {
                number = number * 10 + parseInt(chr, 10);
            } else {
                line += chr;
            }
        }

        const kobitaElement = document.getElementById(KOBITA_ELEMENT_ID);
        if (kobitaElement) {
            const p = document.createElement('p');
            p.textContent = line;
            kobitaElement.appendChild(p);
        }

    } catch (error) {
        console.error("Error during poem line generation:", error);
    }
}

init();