const fs = require("fs");

function format(dir) {
    fs.readFile(dir, (err, data) => {
        const parsestring = "" + data;
        let parsedata = {};
        if (parsestring.startsWith("[")) {
            parsedata = JSON.parse(parsestring);
            for (let i = 0; i < parsedata.length; i++) {
                parsedata[i].international_phone_number = parsedata[i].international_phone_number.replaceAll(" ", "");
                parsedata[i].formatted_phone_number = parsedata[i].formatted_phone_number.replaceAll(" ", "");
            }
        } else {
            parsedata = JSON.parse(`[${parsestring.substring(0,parsestring.length-1)}]`);
            for (let i = 0; i < parsedata.length; i++) {
                if(parsedata[i].international_phone_number){
                    parsedata[i].international_phone_number = parsedata[i].international_phone_number.replaceAll(" ", "");
                    parsedata[i].formatted_phone_number = parsedata[i].formatted_phone_number.replaceAll(" ", "");
                }
                
            }
            fs.writeFile(dir+".json",JSON.stringify(parsedata),err=>err&&console.log(err))
        }
    });
}

format("./abuja/Abacha Barracks/bar.json")