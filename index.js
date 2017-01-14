'use strict';
const _ = require('lodash'); // For array operations
const moment = require('moment'); // For calculating times and dates
require('moment-precise-range-plugin'); // For more precise durations
const Table = require('cli-table'); // For printing pretty tables to the console
const fs = require('fs');

const parser = require('./parser'); // For parsing the chat history
const config = require('./config');

// Parse the WhatsApp chat history into an array
let messages = parser.parse(fs.readFileSync(config.filename, 'utf8'));

let statsTable = new Table({
    head: ['Metric', 'Value']
});
let startTime = moment(messages[0].time, 'HH:mm');
let startDate = moment(messages[0].date, 'DD-MM-YYYY').hour(startTime.get('hour')).minute(startTime.get('minutes'));
let days = moment().diff(startDate, 'days');
statsTable.push(
    ['Name', config.chatname],
    ['Life', moment.preciseDiff(moment(), startDate)],
    ['Total messages', messages.length],
    ['Msgs / Day', Math.round(messages.length / days * 10) / 10]
);

// Process chat history to calculate total messages and total characters
let stats = _.chain(messages)
    .reduce((state, message) => { // A reducer is basically a for loop but with state
        let replacements = _.toPairs(config.replacements); // Convert replacements object into an array
        // For some reason phone numbers have an invisible character at the beginning
        // of the string (UTF8-202A), aka LEFT-TO-RIGHT EMBEDDING. Therefore .replace()
        // is used to get rid of them for comparison
        message.author = message.author.replace('\u202A', '');
        for(let i = 0; i < replacements.length; i++) {
            if(message.author.trim().toLowerCase() == replacements[i][0].trim().toLowerCase()) {
                message.author = replacements[i][1];
                break;
            }
        }
        let index = _.findIndex(state, {author: message.author}); // Find current index for author, and create one if it doesn't exist
        if(index == -1) {
            state.push({author: message.author, characterCount: message.message.length, messageCount: 1});
        } else {
            // Update the state with the new data
            state[index].characterCount += message.message.length;
            state[index].messageCount ++;
        }
        return state; // Return the state to be fed into the next iteration
    }, [])
    // After messageCount and characterCount have been calculated,
    // characters per message can be calculated
    .each(person => {
        person.charsPerMsg = person.characterCount / person.messageCount;
    })
    .orderBy('characterCount', 'desc')
    .value();

statsTable.push(['Members', stats.length]);

let orderBycharsPerMsg = _.orderBy(stats, 'charsPerMsg', 'desc');
let totalMessages = _.sumBy(stats, 'messageCount');
let totalChars = _.sumBy(stats, 'characterCount');
let detailTable = new Table({
    head: ['Rank', 'Person', 'Messages', 'Characters', 'Chars / Msg']
});

for(let i = 0; i < stats.length; i++) {
    let charsPerMsgIndex = _.findIndex(orderBycharsPerMsg, {author: stats[i].author}); // Calculate rank for characters per message
    // Add a new row to the table of details
    detailTable.push([
        i + 1,
        stats[i].author,`${stats[i].messageCount} (${percentage(stats[i].messageCount, totalMessages)}%)`,
        `${stats[i].characterCount} (${percentage(stats[i].characterCount, totalChars)}%)`,
        `${Math.round(stats[i].charsPerMsg * 10) / 10} (${ordinalify(charsPerMsgIndex + 1)})`
    ]);
}

// Print the tables to the console
console.log(statsTable.toString());
console.log(detailTable.toString());

/**
 * Calculates a percentage and rounds to 2dp
 * 
 * @param {number} value
 * @param {number} total
 * @returns {number} precentage
 */
function percentage(value, total) {
    return Math.round(value / total * 10000) / 100;
}

/**
 * Returns the ordinal string (i.e '1st', '2nd')
 * 
 * @param {number} n - number to ordinalify
 * @returns {string} - ordinal of number
 */
function ordinalify(n) {
    let endings = ["th","st","nd","rd"];
    let remainder = n % 100;
    return n + (endings[(remainder - 20) % 10] || endings[remainder] || endings[0]);
}