const fs = require('fs');
const file = 'c:/Users/Mr Siarudin/Downloads/ethereal-union---wedding-invitation/src/App.tsx';
let txt = fs.readFileSync(file, 'utf8');

// BRIDE REPLACEMENTS
txt = txt.replace(
  'className="flex flex-row-reverse bg-[#2D2D2D] rounded-2xl md:rounded-[4rem] overflow-hidden shadow-2xl group border border-white/5"',
  'className="flex flex-row-reverse bg-[#2D2D2D] rounded-3xl md:rounded-[4rem] overflow-hidden shadow-2xl group border border-white/5 h-[200px] md:h-auto"'
);
txt = txt.replace(
  'className="w-[60%] md:flex-1 py-4 px-4 md:p-16 flex flex-col justify-center relative md:min-h-auto"',
  'className="w-1/2 md:flex-1 p-5 md:p-16 flex flex-col justify-center relative h-full"'
);
txt = txt.replace(
  'className="absolute top-6 left-6 md:top-12 md:left-10 opacity-[0.05] pointer-events-none select-none"',
  'className="absolute top-2 left-2 md:top-12 md:left-10 opacity-[0.05] pointer-events-none select-none overflow-hidden"'
);
txt = txt.replace(
  'className="display-font text-[2.5rem] md:text-8xl text-white uppercase tracking-tighter font-bold"',
  'className="display-font text-[3.5rem] md:text-8xl text-white uppercase tracking-tighter font-bold leading-none"'
);
txt = txt.replace(
  'className="script-font text-3xl md:text-7xl text-white mb-1 md:mb-6 ml-1 md:ml-2"',
  'className="script-font text-[2.5rem] md:text-7xl text-white mb-1 md:mb-6 ml-0 md:ml-2"'
);
txt = txt.replace(
  'className="display-font text-lg md:text-5xl text-white font-medium leading-[1.1] tracking-tight"',
  'className="display-font text-xl md:text-5xl text-white font-medium leading-[1.1] tracking-tight"'
);
txt = txt.replace(
  'className="w-[40%] md:w-[48%] md:h-auto overflow-hidden relative"',
  'className="w-1/2 md:w-[48%] h-full md:h-auto overflow-hidden relative"'
);


// GROOM REPLACEMENTS (using the same strings since String.prototype.replace replaces the first match)
txt = txt.replace(
  'className="flex flex-row bg-[#2D2D2D] rounded-2xl md:rounded-[4rem] overflow-hidden shadow-2xl group border border-white/5"',
  'className="flex flex-row bg-[#2D2D2D] rounded-3xl md:rounded-[4rem] overflow-hidden shadow-2xl group border border-white/5 h-[200px] md:h-auto"'
);
txt = txt.replace(
  'className="w-[60%] md:flex-1 py-4 px-4 md:p-16 flex flex-col justify-center relative md:min-h-auto"',
  'className="w-1/2 md:flex-1 p-5 md:p-16 flex flex-col justify-center relative h-full"'
);
txt = txt.replace(
  'className="absolute top-6 left-6 md:top-12 md:left-10 opacity-[0.05] pointer-events-none select-none"',
  'className="absolute top-2 left-2 md:top-12 md:left-10 opacity-[0.05] pointer-events-none select-none overflow-hidden"'
);
txt = txt.replace(
  'className="display-font text-[2.5rem] md:text-8xl text-white uppercase tracking-tighter font-bold"',
  'className="display-font text-[3.5rem] md:text-8xl text-white uppercase tracking-tighter font-bold leading-none"'
);
txt = txt.replace(
  'className="script-font text-3xl md:text-7xl text-white mb-1 md:mb-6 ml-1 md:ml-2"',
  'className="script-font text-[2.5rem] md:text-7xl text-white mb-1 md:mb-6 ml-0 md:ml-2"'
);
txt = txt.replace(
  'className="display-font text-lg md:text-5xl text-white font-medium leading-[1.1] tracking-tight"',
  'className="display-font text-xl md:text-5xl text-white font-medium leading-[1.1] tracking-tight"'
);
txt = txt.replace(
  'className="w-[40%] md:w-[48%] md:h-auto overflow-hidden relative"',
  'className="w-1/2 md:w-[48%] h-full md:h-auto overflow-hidden relative"'
);


// PARENTS TEXT SIZES (Groom and Bride)
txt = txt.replace(
  'className="sans-font text-[7px] md:text-xs text-white/50 uppercase tracking-widest"',
  'className="sans-font text-[8px] md:text-xs text-white/50 uppercase tracking-widest"'
);
txt = txt.replace(
  'className="sans-font text-[7px] md:text-xs text-white/50 uppercase tracking-widest"',
  'className="sans-font text-[8px] md:text-xs text-white/50 uppercase tracking-widest"'
);
txt = txt.replace(
  'className="sans-font text-[9px] md:text-sm text-white/80 font-medium"',
  'className="sans-font text-[10px] md:text-sm text-white/80 font-medium leading-[1.2]"'
);
txt = txt.replace(
  'className="sans-font text-[9px] md:text-sm text-white/80 font-medium"',
  'className="sans-font text-[10px] md:text-sm text-white/80 font-medium leading-[1.2]"'
);

fs.writeFileSync(file, txt);
