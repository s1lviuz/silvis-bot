import MusicCommands from './music';
import Echo from './Echo';
import Hello from './Hello';
import Disconnect from './Disconnect';

const commands = [
    ...MusicCommands,
    Echo,
    Hello,
    Disconnect
];

export default commands;