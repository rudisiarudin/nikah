const fs = require('fs');
const file = 'c:/Users/Mr Siarudin/Downloads/ethereal-union---wedding-invitation/src/App.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Apply to Bride
txt = txt.replace(
  'rounded-3xl md:rounded-[4rem] overflow-hidden shadow-2xl',
  'rounded-2xl md:rounded-[4rem] overflow-hidden shadow-2xl'
);
txt = txt.replace(
  'className="w-[55%] md:flex-1 p-6 md:p-16 flex flex-col justify-center relative min-h-[180px] md:min-h-auto"',
  'className="w-[60%] md:flex-1 py-4 px-4 md:p-16 flex flex-col justify-center relative md:min-h-auto"'
);
txt = txt.replace(
  'className="display-font text-4xl md:text-8xl text-white uppercase tracking-tighter font-bold"',
  'className="display-font text-[2.5rem] md:text-8xl text-white uppercase tracking-tighter font-bold"'
);
txt = txt.replace(
  'className="script-font text-4xl md:text-7xl text-white mb-2 md:mb-6 ml-1 md:ml-2"',
  'className="script-font text-3xl md:text-7xl text-white mb-1 md:mb-6 ml-1 md:ml-2"'
);
txt = txt.replace(
  'className="display-font text-[1.3rem] md:text-5xl text-white font-medium leading-[1.1] tracking-tight"',
  'className="display-font text-lg md:text-5xl text-white font-medium leading-[1.1] tracking-tight"'
);
txt = txt.replace(
  'className="w-[45%] md:w-[48%] min-h-[180px] md:h-auto overflow-hidden relative"',
  'className="w-[40%] md:w-[48%] md:h-auto overflow-hidden relative"'
);


// Apply to Groom (they have the exact same classes in second block due to my previous replacement, but String.prototype.replace only replaces FIRST occurrence. So I will just repeat the exactly same replacements!)

txt = txt.replace(
  'rounded-3xl md:rounded-[4rem] overflow-hidden shadow-2xl',
  'rounded-2xl md:rounded-[4rem] overflow-hidden shadow-2xl'
);
txt = txt.replace(
  'className="w-[55%] md:flex-1 p-6 md:p-16 flex flex-col justify-center relative min-h-[180px] md:min-h-auto"',
  'className="w-[60%] md:flex-1 py-4 px-4 md:p-16 flex flex-col justify-center relative md:min-h-auto"'
);
txt = txt.replace(
  'className="display-font text-4xl md:text-8xl text-white uppercase tracking-tighter font-bold"',
  'className="display-font text-[2.5rem] md:text-8xl text-white uppercase tracking-tighter font-bold"'
);
txt = txt.replace(
  'className="script-font text-4xl md:text-7xl text-white mb-2 md:mb-6 ml-1 md:ml-2"',
  'className="script-font text-3xl md:text-7xl text-white mb-1 md:mb-6 ml-1 md:ml-2"'
);
txt = txt.replace(
  'className="display-font text-[1.3rem] md:text-5xl text-white font-medium leading-[1.1] tracking-tight"',
  'className="display-font text-lg md:text-5xl text-white font-medium leading-[1.1] tracking-tight"'
);
txt = txt.replace(
  'className="w-[45%] md:w-[48%] min-h-[180px] md:h-auto overflow-hidden relative"',
  'className="w-[40%] md:w-[48%] md:h-auto overflow-hidden relative"'
);

fs.writeFileSync(file, txt);
