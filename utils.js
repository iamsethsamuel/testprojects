const readline = require("readline");
const fs = require("fs")
const cron = require("node-cron")

function input(message) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    return new Promise((resolve, reject) => {
        rl.question(message, (code)=>{
            rl.close()
            resolve(code)
            // console.log(code)
        });
    });
}

function openFile(path){

    return new Promise((resolve, reject)=>{
        fs.readFile(path,(err, data)=>{
            if(err){
                reject(err)
            }else{
                resolve(data)
            }
        })
    })
}

cron.schedule("30 * * * * *",()=>{
    console.log("called")
})
module.exports = {input: input, openFile:openFile}