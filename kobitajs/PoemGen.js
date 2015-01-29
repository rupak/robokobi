db = {};

function getOptions(p) {
    if (p.length < 2) {
        return p;
    }
    var pp = '', str, chr, chr2, i, j;
    for (i = 0; i < p.length; i++) {
        chr = p.charAt(i);
        if (chr == '[') {
            option = 1;
            str = '';
            for (j = i + 1; j < p.length; j++) {
                chr2 = p.charAt(j);
                if (chr2 == ']') {
                    option--;
                    if (option == 0) {
                        break;
                    }
                } else if (chr2 == '[') {
                    option++;
                }
            }
            if (option == 0) {
                str = p.substr(i + 1, j - i - 1);
                i = j;
            } else {
                console.log("Error in options parsing");
                return '';
            }
            pp += (random(2) == 1) ? getOptions(str) : '';
        } else {
            pp += chr;
        }
    }
    return pp;
}

function init() {
	$.getJSON("kobitajs/db.json", function(json) {
		db = json;
		start();
    })


}

function start() {
	$("#brain")[0].value = JSON.stringify(db, null, 4);
	make_poem();
}

function random(maxnum) {
    r = Math.floor(Math.random() * maxnum);
    if (r >= maxnum) r = maxnum - 1;
    return r;
}


function make_poem() {
	$('#kobita').empty();
	new_db_text = $("#brain")[0].value;
	db = jQuery.parseJSON(new_db_text);
    nlines = random(4) + 1;
    for (ilin = 1; ilin <= nlines; ilin++) {
        make_poem_line()
    }
}

function make_poem_line() {
   pattern_group_index = random(db.rules.length);
   pattern_group = db.rules[pattern_group_index];
   pattern_index = random(pattern_group.values.length);
   pattern = getOptions(pattern_group.values[pattern_index]);
   lenpat = pattern.length;
   number = 0;
   line = ''//pattern_group_index + '[' + pattern_index + ']' + ' ';
   for (ichr = 0; ichr < lenpat; ichr++) {
       chr = pattern.charAt(ichr);
       if (chr == '{') {
           number = 0;
       } else if (chr == '}') {
           wrd = db.dict[number - 1].values[random(db.dict[number - 1].values.length)];
		   line = line + wrd;
       } else if ((chr >= '0') && (chr <= '9')) {
           number = number * 10 + (chr.charCodeAt(0) - '0'.charCodeAt(0));
       } else {
		   line = line + chr;
       }
   }
   $('#kobita').append('<p>' + line + '</p>');
}