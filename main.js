const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");

const states = require('./data/states.json')

const url = "https://www.usvotefoundation.org/vote/state-elections/state-election-dates-deadlines.htm?stateName=";

function saveElectionData(fileOutput) {
  fs.writeFileSync('election-calendar.csv', fileOutput);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const rp = function (url) {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, html) {
      if (error) return reject(error)
      return resolve({response, html})
    })
  })
}

function parseHTML(html) {
  let fileOutput = "";
  fileOutput += "Subject, Start Date\n";

  const $ = cheerio.load(html);
  
  let stateName = "UNKNOWN";

  function parseElectionHeader() {
      const text = $(this).text();
      const split = text.split(" - ");
      const title = split[1] || "UNKNOWN";
      const date = new Date(split[0]);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();

      const formattedDate = month + "/" + day + "/" + year;
      const rowText = "\"" + stateName + ": " + title + "\"," + formattedDate;

      fileOutput += rowText + "\n";
  }

  function parseRow() {
      $(this)
        .children().filter(".state-name").first()
        .children().filter("h1")
        .each(function(){
          stateName = $(this).text().replace(" (more info)", "");
        });

      const electionTitle = $(this).children().filter(".election-title")
      const electionHeaders =  electionTitle.children().filter("h2");
      
      electionHeaders.each(parseElectionHeader);
  }

  $('.main-content').each(function () {
    const rows = $(this).children().children().children();
    rows.each(parseRow);
  })

  return fileOutput;
}

async function init() {
  const electionOutputs = []
  for (const state of states) {
    console.log(`Processing state ${state.State}`)
    const {_, html} = await rp(`${url}${state.Code}`);
    const fileOutput = parseHTML(html);
    electionOutputs.push(fileOutput);
    await sleep(1000);
  }
  
  saveElectionData(electionOutputs.join("\n"));
}

(async () => {
  await init()
})()