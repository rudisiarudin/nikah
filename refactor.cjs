const fs = require('fs');
const file = 'c:/Users/Mr Siarudin/Downloads/ethereal-union---wedding-invitation/src/App.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. replace opening UI
lines.splice(266, 114, '          <OpeningUI onOpen={handleOpenInvitation} guestName={guestName} />');

// 2. remove reveal
lines.splice(92, 17);

// 3. add imports
lines[26] = `import { WEDDING_CONFIG } from './config';\nimport { Reveal } from './components/Reveal';\nimport { OpeningUI } from './components/OpeningUI';`;

fs.writeFileSync(file, lines.join('\n'));
