const mysql = require('mysql')

const options = {
    host: '8.129.185.213',
    port: "3306",
    user: 'root',
    password: 'x2462474274',
    database: 'blog'
}

const con = mysql.createConnection(options)

con.connect(err => {
    if (err) {
        return console.log('数据库连接异常')
    }
    console.log('数据库连接成功')
})

function Myquery(sql, param) {
    return new Promise((resolve, reject) => {
        con.query(sql, param, (err, results) => {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}
module.exports = Myquery
