const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The <main> element contains the scrollable right area.
// We want to remove all md:text-* and lg:text-* classes since they are blowing up in the restricted desktop width.
let replacements = 0;

// Simple regex replace for ALL md:text- and lg:text- within the file.
// Wait, we DO NOT want to remove it for <DesktopSidebar>
// Actually, earlier I manually stripped md: properties from Profile Section and Hero section.
// Let's strip ALL `md:text-[size]`, `lg:text-[size]`, `md:gap-[size]`, `md:p-[size]`, `md:w-[size]`, `md:h-[size]`
// from ONLY the <main> block in App.tsx.

const mainMatch = code.match(/<main[\s\S]*?(?=\{\/\* Floating Nav)/);
if (mainMatch) {
  let mainCode = mainMatch[0];
  const oldMainLength = mainCode.length;
  
  mainCode = mainCode.replace(/\s+(md|lg):(text|text|space|gap|p|px|py|pt|pb|pl|pr|w|h|min|max|rounded)-\[?[a-zA-Z0-9.\-]+\]?/g, (match) => {
    replacements++;
    return '';
  });

  // Also catch purely named ones like md:text-5xl, lg:gap-4
  // The regex above catches them all.

  code = code.substring(0, mainMatch.index) + mainCode + code.substring(mainMatch.index + oldMainLength);
  console.log(`Replaced ${replacements} instances of desktop responsive styling inside <main>.`);
  fs.writeFileSync('src/App.tsx', code);
} else {
  console.error("Could not find <main> block!");
}
