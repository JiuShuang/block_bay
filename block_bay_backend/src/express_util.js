import {create} from "kubo-rpc-client"
import express from "express"
import multer from 'multer'
import cors from "cors"
import bodyParser from "body-parser"
import fs from 'fs'

// const {create} =require("kubo-rpc-client")
// const {express} =require("express")
// const {cors} =require("cors")
// const {bodyParser} =require("kubo-rpc-client")

const app = express()
const port = 3000
const json = express.json({type: '*/json'});
app.use(json);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})

const ipfs =create("http://localhost:5001/")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 确保这个文件夹已经存在
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })


app.post('/uploadImage', upload.single('file'), async (req, res) => {
    const file = req.file;
    const filePath="uploads/"+file.originalname
    const fileSync = fs.readFileSync(filePath);
    const uploadResult = await ipfs.add({
            path: 'uploads/' + file.originalname,
            content:fileSync
        }
    )
    console.log(uploadResult.cid.toString())
    res.json({
        tokenImage:"http://localhost:8080/ipfs/"+uploadResult.cid.toString()+'/'+file.originalname
    });
})

app.post('/upload', async (req, res) => {
    const tokenForm = req.body
    const tokenFormResult = await ipfs.add(JSON.stringify(tokenForm));
    const tokenFormCid=tokenFormResult.cid.toString()
    console.log(tokenFormCid)
    res.json({
        tokenCid: "http://localhost:8080/ipfs/"+tokenFormCid
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})