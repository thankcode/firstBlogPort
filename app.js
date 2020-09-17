const express = require('express');

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

const query = require('./mysql')

/*express允许跨域*/

app.all('*', function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");

    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");

    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

    res.header("X-Powered-By", ' 3.2.1')

    if (req.method == "OPTIONS") res.send(200);

    else next();

});

//app.use(express.static(path.join(__dirname, 'public')));

// 基本信息  
app.get('/author', async(req, res) => {

    //作者信息
    const authorSql = 'SELECT * from author'
    const otherSql = 'SELECT * from article'
    const runTimeSql = "show global status like 'uptime'"
    const articleNumSql = 'SELECT COUNT(*) as num FROM article'

    const author = await query(authorSql, {})
    const other = await query(otherSql, {})
    const runTime = await query(runTimeSql, {})
    const articleNum = await query(articleNumSql, {})
    let blogInfo = {
        author: author[0],
        other: other[0],
        runTime: runTime[0],
        articleNum: articleNum[0]
    }
    res.json(blogInfo)
})

// 获取文章title
app.get('/newArticle', async(req, res) => {
        // 获取最新文章
        const getNewArticleSql = 'SELECT theme,id FROM article  ORDER BY id DESC LIMIT 0,10'

        const NewArticle = await query(getNewArticleSql, {})

        res.json({
            newArticle: NewArticle
        })

    })
    // 配置分页+文章总数
app.post('/allArticle', async(req, res) => {

    const currentPage = req.body.currentPage
    let first
    if (currentPage === 1) {
        first = 0
    } else {
        first = currentPage * 5 - 4
    }
    // 获取最新文章
    const allArticleSql = `SELECT * FROM article  ORDER BY id DESC LIMIT ${first},5`
    const articleNumSql = 'SELECT COUNT(id) as num FROM article'

    const articleNum = await query(articleNumSql, {})
    const allArticle = await query(allArticleSql, {})

    res.json({
        newArticle: allArticle,
        articleNum: articleNum[0]
    })

})

// 根据id 获取正文内容
app.post('/bodycontent', async(req, res) => {
    const ip = req.ip
    const id = req.body.id

    const sql = `SELECT * FROM article WHERE id = ${id}`
    const IPSql = `SELECT ip FROM UserIP_articleID WHERE articleID = ${id}`

    const ip_list = await query(IPSql, {})


    let isForbid = true
    if (ip_list.length) {
        ip_list.forEach((item, i) => {
            if (item.ip === ip) {
                isForbid = false
                return
            }
        });
    }

    const bodycontent = await query(sql, {})
    res.json({
        bodycontent: bodycontent[0],
        isForbid: isForbid
    })
})

app.post('/addLike', async(req, res) => {
    const ip = req.ip
    const id = req.body.id

    let like = ++req.body.like
    const addLikeSql = `UPDATE article SET likeNum = ${like} WHERE id = ${id}`
    const insertSql = `INSERT INTO UserIP_articleID (ip,articleID) VALUES('${ip}', ${id})`

    const addLike = await query(addLikeSql, {})
    await query(insertSql, {})
    res.json(addLike)
})

app.post('/addComment', async(req, res) => {
    const body = req.body
    const addConment = `INSERT INTO topic 
	                            (topic_id, content, user, email, website)
                            VALUES('${body.id}','${body.formData.content}','${body.formData.name}','${body.formData.email}','${body.formData.url}')`
    const result = await query(addConment, {})
    res.json(result)
})

app.get('/getComment', async(req, res) => {

    const param = req.query
    const mainGetComment = `SELECT *from topic WHERE topic_id = ${param.id}`
    let result = await query(mainGetComment, {})
        // result.forEach(async(item, i) => {
        //     let sql = `SELECT *from reply WHERE reply_id = ${item.id}`
        //     item.children = await query(sql, {})
        //     console.log(item)
        // })

    let result1 = result.map(item => {

        let sql = `SELECT *from reply WHERE reply_id = ${item.id}`
        item.children = query(sql, {})
        console.log(item)
        return item
    })

    res.json(result1)
})

app.use((req, res) => {
    res.json({})
})

app.listen(3000, () => {
    console.log('Run Server 3000Prot')
});