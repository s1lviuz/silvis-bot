# Discord Bot Project

This is a project for a Discord bot developed in JavaScript/TypeScript. The bot offers various functionalities like audio control, integration with Spotify and YouTube, and responds to custom commands on Discord.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [License](#license)

## Features

- Audio playback control (play, stop, skip, etc.)
- Integration with Spotify to play songs
- Integration with YouTube
- Custom commands for user interaction

## Installation

### Prerequisites

Ensure you have Node.js and npm installed. You can download them [here](https://nodejs.org/).

### Steps

1. Clone the repository:

    ```bash
    git clone <REPOSITORY_URL>
    cd <REPOSITORY_NAME>
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Optional: If you plan on using Docker, build the Docker image:

    ```bash
    docker build -t discord-bot .
    ```

### Dockerfile: Dependencies Details

The project includes a Dockerfile listing all needed dependencies.

```dockerfile
FROM node:alpine as builder

RUN apk add --no-cache python3 py3-pip python3-dev py3-pillow
RUN apk add --no-cache build-base cmake git
RUN apk add --no-cache libsodium libtool autoconf automake
RUN apk add --no-cache ffmpeg

RUN pip install spotdl --break-system-packages
RUN pip install python-dotenv --break-system-packages

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_PATH=./dist

RUN npm run build

CMD [ "npm", "start" ]
```

### System Dependencies
For setting up the environment locally with the same dependencies, use the following commands:

For Debian-based systems (includes Ubuntu):

```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-dev python3-pillow build-essential cmake git libsodium-dev 
libtool autoconf automake ffmpeg
```

#### For Alpine-based systems:

```bash
apk add --no-cache python3 py3-pip python3-dev py3-pillow build-base cmake git libsodium libtool autoconf automake ffmpeg
```

#### Installing Python Dependencies
    
```bash
pip install spotdl python-dotenv
```

#### Installing Node.js Dependencies
Run the following commands in the root of your project:

```bash
npm install
```
```bash
npm run build
```

### Configuration
Create a .env file in the root directory of the project based on the provided example. This file should contain your environment variables, including Discord tokens and Spotify API keys.

Example .env file

```env
DISCORD_TOKEN="YOUR_DISCORD_TOKEN"
DISCORD_CLIENT_ID="YOUR_DISCORD_CLIENT_ID"
DISCORD_GUILD_ID="YOUR_DISCORD_GUILD_ID"

SPOTIFY_CLIENT_ID="YOUR_SPOTIFY_CLIENT_ID"
SPOTIFY_CLIENT_SECRET="YOUR_SPOTIFY_CLIENT_SECRET"

DEPLOYMENT_TYPE="guild"  # or "global"
```

### Usage
To start the bot, run the command:

```bash
npm start
```

Now your bot should be active on the specified Discord server.

### Available Commands

`/play` `<url>`: Plays music from YouTube or Spotify.
`/pause`: Pauses the music playback.
`/stop`: Stops the music playback.
`/skip`: Skips the current track.

### Project Structure
```
├── src/
│   ├── commands/
│   │   ├── stop.js
│   │   ├── skip.js
│   ├── listeners/
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   ├── lib/
│   │   ├── youtubei.js
│   ├── audio-player/
│   │   ├── index.js
│   ├── deploy-commands.js
├── .env
├── package.json
├── README.md
```

### Commands
stop.js
```js
"use strict";
const { ApplicationCommandType } = require("discord.js");
const { getPlayer } = require("../../audio-player");
const { setStoppedByCommand } = require("./Play");

const Stop = {
    name: "stop",
    description: "Stops the player",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    run: async (client, interaction) => {
        await interaction.deferReply();
        try {
            const player = getPlayer();
            setStoppedByCommand(true);
            player.stop();
            return interaction.followUp("Player stopped");
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to stop the player");
        }
    }
};

export default Stop;
```
skip.js
```js
"use strict";
const { ApplicationCommandType } = require("discord.js");
const { getPlayer } = require("../../audio-player");

const Skip = {
    name: "skip",
    description: "Skips the current track",
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    run: async (client, interaction) => {
        await interaction.deferReply();
        try {
            const player = getPlayer();
            player.skip();
            return interaction.followUp("Skipped the current track");
        } catch (error) {
            console.error(error);
            return interaction.followUp("Failed to skip the track");
        }
    }
};

export default Skip;
```

### Listeners
ready.js
```js
"use strict";
const ready = (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
};

export default ready;
```

interactionCreate.js
```js
"use strict";
const interactionCreate = (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.run(client, interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    });
};

export default interactionCreate;
```

### How to Contribute

Steps to Contribute
- Fork the repository.
- Create a new branch (git checkout -b feature/your-feature-name).
- Make your changes and commit them (git commit -am 'Add new feature').
- Push to the branch (git push origin feature/your-feature-name).
- Open a Pull Request.


### License
This project is licensed under the MIT License. See the LICENSE file for more details.