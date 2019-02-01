var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");

var fileOutput = "";
fileOutput += "Subject, Start Date\n";

var url = "https://www.usvotefoundation.org/vote/state-elections/state-election-dates-deadlines.htm";
request(url, function(error, response, html) {
  var $ = cheerio.load(html);

  $('.main-content').each(function(){
    var rows = $(this).children().children().children();
    var stateName = "UNKNOWN";
    rows.each(function(){
      $(this).children().filter(".state-name").first().children().filter("h1").each(function(){
        stateName = $(this).text().replace(" (more info)", "");
        console.log(stateName);
      })
      var title = "UNKNOWN";
      $(this).children().filter(".election-title").children().filter("h2").each(function(){
        var text = $(this).text();
        var split = text.split(" - ");
        var title = split[0];
        var date = new Date(split[1]);
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();

        var formattedDate = month + "/" + day + "/" + year;
        //subject, start date
        var rowText = "\"" + stateName + ": " + title + "\"," + formattedDate;
        console.log("   " + title);
        console.log("   " + date);
        console.log("     " + rowText);
        console.log("   ");

        fileOutput += rowText + "\n";

      })
    })
  })
  console.log(fileOutput);
  fs.writeFile('election-calendar.csv', fileOutput, function(err){
    if(!err){

      console.log('success');
    } else {
      console.log(err);
    }
  })
})
