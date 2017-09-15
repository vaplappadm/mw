var http = require('http');
var fs=require('fs');
var PDFDocument = require('pdfkit');

var d = new Date;
var date= d.getDate();
var month= d.getMonth()+1;
var year= d.getFullYear();
var hour= d.getHours();
var minute= d.getMinutes();

createDemandSheet();

function createDemandSheet (){



     doc = new PDFDocument;
     var nowdate = date+"-"+month+"-"+year+"-"+hour+":"+minute;

     var docName = "Demand_"+nowdate+'.pdf';

     doc.pipe (fs.createWriteStream('demands/'+docName));




     doc.font('Helvetica')
              .fontSize(30)
              .text('Vasudhaavana', 300, 45, 100, 100);
     doc.font('Helvetica')
               .fontSize(10)
               .text('Near Ullalu Upanagar, Mallathahalli)', 340, 70, 100, 100);
     doc.font('Helvetica')
               .fontSize(10)
               .text('CABLE ADDRESS:Ambedkar College', 340, 80, 100, 100);
     doc.font('Helvetica')
               .fontSize(10)
               .text('TELEX NO:12345678', 340, 90 , 100, 100);

     doc.moveDown();

       doc.font('Helvetica')
       doc.fontSize(10);
       doc.text('Customer Name: ',40, 130 , 100, 100);
       doc.fillColor('#21D46A');
       doc.text("CONTACT NUMBER",180, 130 , 100, 100);
       doc.fillColor('black');
       doc.text('DATE: ',40, 140 , 100, 100);
         doc.fillColor('#21D46A');
       doc.text("22 Aug 2017",180, 140 , 100, 100);
       doc.fillColor('black');
       doc.text('Quantity: ',40, 150 , 100, 100);
       doc.fillColor('black');
       doc.text('Status: ',40, 160 , 160, 100);
         doc.fillColor('#21D46A');
       doc.text("Active",180, 160 , 100, 100);

       doc.font('Helvetica')
       doc.fontSize(10);
       doc.fillColor('black');
       doc.text('Sadashiva Panchakshari',400, 140 , 100, 100);
       doc.text('No Milk',400, 150 , 100, 100);
       doc.fillColor('#21D46A');
       doc.text("Today",480, 150 , 100, 100);



     doc.fillColor('#CCC');
       doc.rect(0, 700, 610, 1)
         .fill('#AAA')
         .stroke();


     doc.text('Head Office : iBank, Magadi Main Road, Nagarhoeff - 12345 - http://www.vasu.com  ',150, 705 , 610, 1);


     doc.end();



     return docName;
   };
