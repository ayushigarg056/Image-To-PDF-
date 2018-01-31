const express = require('express');
const bodyParser= require('body-parser');
const fs = require('fs');

const app = express();

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended : false}));

app.post('/makePDF', function (req, res) {
    
    console.log('post api')

    var PDFDocument, doc;
    PDFDocument = require('pdfkit');
    doc = new PDFDocument;

    var myObj = req.body.jsonObject

    var flag = 0
    var currImageString = ''

    for (var i in myObj){
        
        if (myObj[i] == ','){
            var bitmap = new Buffer(currImageString, 'base64');

            var photoName = makeid()

            fs.writeFileSync("images/" + photoName + ".jpg", bitmap);

            doc.image('images/' + photoName + '.jpg', 0, 0, {width: 625, height: 900});
            doc.addPage()

            fs.unlink('./images/' + photoName + '.jpg',function(err){
                if(err) return console.log(err);
            });

            currImageString = ''
        }

        else if (myObj[i] == '}'){

            flag = 0
            var bitmap = new Buffer(currImageString, 'base64');

            var photName = makeid()

            fs.writeFileSync("images/" + photName + ".jpg", bitmap);

            doc.image('images/' + photName + '.jpg', 0, 0, {width: 625, height: 900});

            fs.unlink('./images/' + photName + '.jpg',function(err){
                if(err) return console.log(err);
            });
        }

        else if (flag == 1){
            currImageString += myObj[i]
        }

        else if (myObj[i] == '{'){
            flag = 1
        }

    }

    doc.pipe(fs.createWriteStream('output.pdf'));
    doc.end();

    res.send('hogya bhai')

})

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

console.log(makeid());

app.get('/downloadPDF', function(req, res){
    // Downloading file
    // var file = __dirname + '/output.pdf';
    // res.download(file);

    // Rendering on Browser
    console.log('get api')
    var img = fs.readFileSync('./output.pdf');
    res.writeHead(200, {'Content-Type': 'application/pdf' });
    res.end(img, 'binary');
});

app.listen(5211,function(){
    console.log("Server started on http://localhost:5211");
})