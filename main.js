const fs = require("fs");

const rp = require("request-promise");
const cheerio = require("cheerio");
const states = require('./data/states.json')

const url = "https://www.usvotefoundation.org/vote/state-elections/state-election-dates-deadlines.htm?stateName=";

function saveElectionData(fileOutput) {
  fs.writeFileSync('election-calendar.csv', fileOutput);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseElectionHeader(text) {
  const split = text.split(" - ");
  const title = split[1] || "UNKNOWN";
  const date = new Date(split[0]);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  return [title, formattedDate];
}

function parseHTML(html, stateName) {
  const $ = cheerio.load(html);

  const electionHeaders = $('.main-content .election-title')
    .map(function () {
      return $(this).text();
    })
    .get();
  
  const rowString = electionHeaders.map((headerText) => {
    const parsedData = parseElectionHeader(headerText);
    const rowItem = [stateName, ...parsedData]
    return rowItem.join(',')
  });

  return rowString.join('\n');
}

async function init() {
  const electionOutputs = [
    "State,Title,Start Date",
  ];

  for (const state of states) {
    console.log(`Processing state ${state.State}`)
    const html = await rp(`${url}${state.Code}`);
    const row = parseHTML(html, state.State);
    electionOutputs.push(row);
    saveElectionData(electionOutputs.join("\n"));
    await sleep(100);
  }
}

(async () => {
  await init()
})()