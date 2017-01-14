'use strict';
const lodash = require('lodash'); // For array operations

// These extract helpful information from the log
const infoRegex = /\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/g;
const searchRegex = /(\d{2}\/\d{2}\/\d{4}), (\d{2}:\d{2}) - (.+?): (.+)/g;

module.exports.parse = function(data) {
    let grouped = [];
    let split = data.trim().split('\n'); // Split each text file into lines
    for(let i = 0; i < split.length; i++) {
        let line = split[i];
        let searcher = new RegExp(searchRegex);
        let data = searcher.exec(line); // Extract data from the line
        // Result should only be saved if it contains a date, time, author and message.
        // This removes other messages such as subject or icon changes
        if(data && data[1] && data[2] && data[3] && data[4] && !data[3].includes('changed the subject from')) {
            grouped.push({date: data[1].trim(), time: data[2].trim(), author: data[3].trim(), message: data[4].trim()});
        // If this is not the beginning of a new message, it is a new line of
        // the message before and so should be appended
        } else if(!line.match(infoRegex)) {
            grouped[grouped.length - 1].message += '\n' + line;
        }
    }
    return grouped;
};