const mysql2 = require('mysql2/promise')
const csv = require('csv-parse')
const fs = require('fs')
const uuid = require("binary-uuid")

const connectionPool = createConnectionPool();

function createConnectionPool(){
    return  mysql2.createPool({
        host: 'pjp-rds-payment.povo.jp',
        user: 'pjp_payment',
        password: 'O93s5ciyNR',
        database: 'pjp_payment',
    })
}

function fileRead(){
    const dirPath = "/home/nodeuser/current/gmo-data/1MInsert/files"

    fs.readdir(dirPath,async (err,files)=>{
            if(err){
                return console.log("Unable to scan directory:",err)
            }
            for(let j=0;j<files.length;j++){
                let fileContent =  fs.readFileSync(dirPath+"/"+files[j])
                let lines = fileContent.toString().split("\n")
                console.log(lines.length)
                for(let i=0;i<lines.length;i++){
                    let line = lines[i]
                    let data = await mySqlProcess([uuid.createBinaryUUID().uuid,line,line,line,'mock',1])
                    console.log(i+":"+line+" is done")
                }
                // for(let i=0;i<lines.length;i++){
                //    let line = lines[i].split(",")
                //     if(line.length<4){
                //         console.log("at end of file")
                //         continue
                //     }
                //     let data = await mySqlProcess([uuid.createBinaryUUID().uuid,line[0],line[1],line[2],'mock',1,'{}'])
                //     console.log(i+":"+line[0]+" is done")
                // }
            }
    })
}

async function mySqlProcess(row){
    return new Promise((async (resolve, reject) => {
        const stmt_delete = "DELETE  FROM v3_payment_instruments where billing_account_number = ?;"
        const stmt_insert = "INSERT INTO v3_payment_instruments(id,customer_account_number,service_instance_number,billing_account_number" +
            ",gateway,is_default,created_at,updated_at,metadata) values(?,?,?,?,?,?,now(),now(),'{}');"
        await connectionPool.query(stmt_delete,[row[1]])
        let r = await connectionPool.query(stmt_insert,row)
        resolve(r)
    }))
}

async function main(){
    fileRead()
}

main()

console.log("end")

