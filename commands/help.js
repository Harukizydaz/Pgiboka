const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'chilli',
  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: command.name,
        description: command.description,
        payload: `${command.name.toUpperCase()}_PAYLOAD`
      };
    });

    const totalCommands = commandFiles.length;
    const commandsPerPage = 5; // Number of commands per page
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    // Handle "help all"
    if (args[0] && args[0].toLowerCase() === 'all') {
      // Text version of all commands
      const helpTextMessage = `📋 | CMD List:\n🏷 Total Commands: ${totalCommands}\n\n${commands.map((cmd, index) => `${index + 1}. ${cmd.title} - ${cmd.description}`).join('\n\n')}\n\nIf you have any problems with the pagebot, contact the developer:\nFB Link: https://www.facebook.com/Churchill.Dev4100`;

      // Provide only a few essential floating buttons to avoid exceeding the limit
      const essentialQuickReplies = commands.slice(0, 13).map((cmd) => ({
        content_type: "text",
        title: cmd.title,
        payload: cmd.payload
      }));

      // Send all commands in text, and a limited number of floating buttons
      return sendMessage(senderId, {
        text: helpTextMessage,
        quick_replies: essentialQuickReplies,  // Only 13 commands max as quick replies
        buttons: [
          {
            type: "web_url",
            url: "https://www.facebook.com/Churchill.Dev4100",
            title: "Contact Developer"
          }
        ]
      }, pageAccessToken);
    }

    // For paginated help, show only the commands for the current page
    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const commandsForPage = commands.slice(startIndex, endIndex);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, { text: `Invalid page number. There are only ${totalPages} pages.` }, pageAccessToken);
    }

    // Text version of commands for the current page
    const helpTextMessage = `📋 | CMD List (Page ${page} of ${totalPages}):\n🏷 Total Commands: ${totalCommands}\n\n${commandsForPage.map((cmd, index) => `${startIndex + index + 1}. ${cmd.title} - ${cmd.description}`).join('\n\n')}\n\nType "help [page]" to see another page, or "help all" to show all commands.\n\nIf you have any problems with the pagebot, contact the developer:\nFB Link: https://www.facebook.com/Churchill.Dev4100`;

    // Provide quick replies for commands on the current page
    const quickRepliesPage = commandsForPage.map((cmd) => ({
      content_type: "text",
      title: cmd.title,
      payload: cmd.payload
    }));

    // Send the message with text and floating buttons (quick replies)
    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickRepliesPage,  // Floating buttons for current page commands
      buttons: [
        {
          type: "web_url",
          url: "https://www.facebook.com/Churchill.Dev4100",
          title: "Contact Developer"
        }
      ]
    }, pageAccessToken);
  }
};
