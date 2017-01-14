# Voicebox
A badly written, WhatsApp history parsing and statistic generating tool.

## Requirements
- NodeJS
- NPM / Yarn
- WhatsApp (duh)

## Quick start
1. Clone / download
2. ```npm install``` or ```yarn install```
3. Get a WhatsApp chat history log (see instructions below)
4. Configure (see instructions below)
5. Run the tool with ```node index.js```

## Configuration
Create a ```config.js``` file that exports:

1. ```filename``` - ```string``` - the path to the chat log (can be relative)
2. ```chatname``` - ```string``` - used when printing info (often part of the history filename)
3. ```replacements``` - ```object``` - for linking multiple numbers to one author

Example config file:
```
// config.js

module.exports = {
    filename: 'WhatsApp Chat with Chatname.txt',
    chatname: 'Chatname',
    replacements: {
        '+44 07700 900060': 'Bob'
    }
};
```

## Getting a WhatsApp chat history
1. Open up a WhatsApp chat on your phone
2. Open the menu (three stacked dots)
3. Click more
4. Hit 'Email Chat' and send it to yourself
5. You don't need to send the media
6. Download, save into the folder with this tool and begin!