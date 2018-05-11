var express = require('express');
var app = express();
//var phantom = require('phantom');
var wkhtmltopdf = require('wkhtmltopdf');
//wkhtmltopdf.command ='C:/Program Files/wkhtmltopdf/bin/wkhtmltopdf.exe'
var fs = require("fs");
var archiver = require('archiver');
// var adm_zip = require('adm-zip');

//var zipper = require("zip-local");


var RESOURCE_PATH_PREFIX = "../resource/"


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/toNodeGetPdf',async function(req, res) {
//    res.send({id:req.params.id, name: req.params.password});
  try{
//    var task = [];
  
    var ids = getParams(req.url) // 简历id
//    console.log('导出'+ids)
    var time = new Date().getTime();
    var randomNum = Math.random()*1000000+""
    var fileName = randomNum.replace(".","")+"-"+time;  // 这是文件夹名称
    
    var idArr = ids.split("-");
  
//    for(var id of idArr){
//        task.push(id);
//    }
  
    
    await exportPDF(fileName,idArr,res)
    try{
//      await exportPDF(fileName,idArr)
//      await task.splice(task.indexOf(id), 1);
    }catch(e){
      console.log("导出失败："+id + e);
    }
 
  
    await console.log("输出完成");
    
//    console.log("正在压缩");
//    await pakageFile(fileName, idArr, res);
//    console.log("压缩完成，正在传输");
    
//    await setTimeout(function () {
//      console.log("正在压缩");
//      pakageFile(fileName, idArr);
//      console.log("压缩完成，正在传输");
//    }, 500)
//    setTimeout(function () {
//    }, 1000)
    
  }catch(e){
    console.log(e);
    res.json({code:1,msg:"操作失败"})
  }
        
});

function exportPDF (fileName,idArr, res){
  let num = idArr.length
//  phantom
//  const instance = await phantom.create();
//  const page = await instance.createPage();
//
//  for(var id of idArr){
//    console.log('正在导出'+id)
//    const status = await page.open('http://192.168.1.115:8765/export/resume?rrid=' + id);
////    const status = await page.open('http://api-test.chaorenjob.com/export/resume?rrid=' + id);
//    page.render('../resource/'+fileName+'/' + id +'.pdf');
//    console.log("导出文件"+fileName+'/' + id +'.pdf')
//  }
//  
//  await instance.exit();
  
//  wkhtmltopdf
//    new Promise()
    fs.mkdirSync('../resource/'+fileName); 
    console.log('创建目录')
//	let url = 'http://192.168.1.115:5020/dabai-page/export/resume/' // 开发
	let url = 'http://h5-test.chaorenjob.com/export/resume/' // 测试
    for(var id of idArr){
      console.log('正在导出'+id)
//      await wkhtmltopdf('http://192.168.1.115:8765/export/resume?rrid=' + id, { output: '../resource/'+fileName+'/' + id +'.pdf'});
//      wkhtmltopdf('http://192.168.1.115:8765/export/resume?rrid=' + id)
//      .pipe(fs.createWriteStream('../resource/'+fileName+'/' + id +'.pdf')); // 开发
	  console.log(url + id)
      wkhtmltopdf(url + id, {pageSize: 'A4', 'margin-left': '3mm', 'margin-right': '3mm', 'margin-top': '3mm', 'margin-bottom': '3mm', 'disable-smart-shrinking': true, 'page-width': 170}, function(err, stream){
//      wkhtmltopdf(url + id, {pageSize: 'A4', marginLeft: '3mm', marginRight: '3mm', marginTop: '3mm', marginBottom: '3mm', 'disable-smart-shrinking': true, pageWidth: '170mm'}, function(err, stream){
        if(num <= 1) {
          pakageFile(fileName, idArr, res)
        } else {
          num--
        }
      }) // 测试
      .pipe(fs.createWriteStream('../resource/'+fileName+'/' + id +'.pdf'));
      console.log("导出文件"+fileName+'/' + id +'.pdf')
    }
};
  
function pakageFile(fileName, idArr, res){
    console.log("正在压缩");
    function readFile(path) {
      let sizeBool = true
       files = fs.readdirSync(path);//需要用到同步读取
       files.forEach(walk);
       function walk(file){ 
            states = fs.statSync(path+'/'+file);         
            if(states.isDirectory())
            {
                readFile(path+'/'+file);
            }
            else
            {   
                console.log(states.size)
                if (states.size < 1000) {
                  sizeBool = false
                }
                //创建一个对象保存信息
//                var obj = new Object();
//                obj.size = states.size;//文件大小，以字节为单位
//                obj.name = file;//文件名
//                obj.path = path+'/'+file; //文件绝对路径
//                filesList.push(obj);
            }     
        }
      if (sizeBool) {
        var output = fs.createWriteStream('../resource/'+fileName+'/resume.zip');
        var archive = archiver('zip', {
          zlib: { level: 2 } // Sets the compression level.
        });
        archive.pipe(output);
        for(var id of idArr){
          archive.append(fs.createReadStream('../resource/'+fileName+'/' + id + '.pdf'), { name: id + '.pdf' });
        }
        archive.finalize();
        clearInterval(inter)
        console.log("压缩完成，正在传输");
        setTimeout(function(){
          res.download("../resource/"+fileName+"/resume.zip")
          console.log("传输完成");
        }, 100)
      }
    }
//    while (true) {
//      readFile('../resource/'+fileName)
//    }
    var inter = setInterval(function(){
      readFile('../resource/'+fileName)
    }, 1000)
//    console.log(states)
    
}

function getParams(url){
  console.log(url)
  if(url){
    var paramStr = url.replace("/toNodeGetPdf?id=", '')
    return paramStr;
  }else{
    return "0";
  }
}

function clearFile (path) {
  var files = [];
  if( fs.existsSync(path) ) {
    console.log('存在' + path)
      files = fs.readlogSync(path);
      console.log(files)
      files.forEach(function(file,index){
          var curPath = path + "/" + file;
          if(fs.statSync(curPath).islogectory()) { // recurse
//              clearFile(curPath);
            if (new Date().getTime() - Number(file.split('-')[1]) > 86400000) {
              clearFile(curPath);
              console.log('清除成功')
            }
            console.log(new Date().getTime() - Number(file.split('-')[1]))
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
    if (path !== '../resource') {
      fs.rmlogSync(path)
      console.log('清除垃圾文件成功')
    }
  }
}

setInterval(function (){
  clearFile('../resource')
} , 86400000)

app.listen(7000);
console.log('Listening on port 7000...');