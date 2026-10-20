import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, 'src', name), 'utf8').replace(/\r\n/g, '\n');
const vendor = name => readFileSync(resolve(root, 'vendor/anatomy', name), 'utf8').replace(/\r\n/g, '\n');
const safeScript = code => code.replace(/<\/(script)/gi, '<\\/$1');
const exported = code => [...code.matchAll(/^export (?:function|const|class)\s+(\w+)/gm)].map(match => match[1]).join(',');

function replaceOnce(template, from, to) {
  if (!template.includes(from)) throw new Error('Build marker missing: ' + from);
  return template.replace(from, () => to);
}

function browserModule(filename, name, bindings = '') {
  const code = read(filename);
  const names = exported(code);
  if (!names) throw new Error('No browser exports in ' + filename);
  return `window.${name}=(()=>{${bindings}\n${code.replace(/^import[^\n]*\n/gm, '').replace(/^export /gm, '')}\nreturn Object.freeze({${names}});})();`;
}

function journeyModules() {
  return browserModule('pets-model.mjs', 'AtlasPetModel') + '\n' +
    browserModule('journey.mjs', 'AtlasJourneyModel', 'const {createPetState,normalizePetState}=window.AtlasPetModel;') +
    '\nlet atlasStorage;try{atlasStorage=window.localStorage;}catch{}window.AtlasJourney=window.AtlasJourneyModel.createJourney(atlasStorage);window.addEventListener("storage",e=>{if(e.key===window.AtlasJourneyModel.JOURNEY_KEY||e.key===null)window.AtlasJourney.refresh();});';
}

export function renderPage() {
  const core = vendor('iso-kit.mjs'), lathe = vendor('lathe.mjs');
  const anatomy = `window.AnatomyKit=(()=>{${core.replace(/^export /gm, '')}\nreturn {${exported(core)}};})();\nwindow.AnatomyLathe=(()=>{const {cameraOf,iso,pathOf}=window.AnatomyKit;${lathe.replace(/^import[^\n]*\n/gm, '').replace(/^export /gm, '')}\nreturn {${exported(lathe)}};})();`;
  let template = read('index.template.html');
  const enhancements = [
    ['<div class="learning-grid">', '<div class="lesson-tools"><button type="button" class="text-btn" id="lesson-reading-open" aria-haspopup="dialog">Adjust reading</button></div><div class="learning-grid">'],
    ['<form id="answer-form">', '<button type="button" class="text-btn" id="practice-calculator-open" aria-haspopup="dialog">Open scientific calculator ↗</button><form id="answer-form">'],
    ['<button class="text-btn" id="reset-controls">Reset</button>', '<div class="visual-actions"><button type="button" class="text-btn" id="visual-expand">Enlarge diagram</button><button class="text-btn" id="reset-controls">Reset</button></div>'],
    ['<div id="visual-stage"', '<div id="visual-options" class="visual-options" hidden><div class="visual-switch" aria-label="Diagram view"><button type="button" id="view-flat" aria-pressed="false">Flat view</button><button type="button" id="view-isometric" aria-pressed="true">Isometric view</button></div><label class="separate-layers" id="separate-layers-label" hidden><input type="checkbox" id="separate-layers"> Separate layers</label></div><div id="visual-stage"'],
    ['<ol id="worked-steps" class="worked-steps"></ol>', '<ol id="worked-steps" class="worked-steps" aria-live="polite"></ol><button type="button" class="text-btn step-back" id="step-back" hidden>← Previous step</button>'],
    ['<p id="prerequisite-text"></p>', '<p id="prerequisite-text"></p><div id="prerequisite-links" class="support-bridge"></div><details class="math-glossary"><summary>Quick math words</summary><dl id="math-glossary"></dl></details>'],
    ['</main>', '<dialog id="visual-dialog" aria-labelledby="expanded-title"><div class="dialog-heading"><h2 id="expanded-title">Explore the diagram</h2><button class="text-btn" id="visual-close" aria-label="Close enlarged diagram">Close ✕</button></div><div id="expanded-visual"></div><p id="expanded-caption"></p></dialog></main>']
  ];
  for (const [from, to] of enhancements) template = replaceOnce(template, from, to);
  template = replaceOnce(template, '/*APP_CSS*/', [read('style.css'), vendor('iso.css'), read('isometric.css'), read('reading-support.css'), read('calculator.css'), read('library-rewards.css'), read('pets.css')].join('\n'));
  template = replaceOnce(template, '/*CURRICULUM_JS*/', safeScript([anatomy, read('isometric.js'), journeyModules(), read('reading-support.js'), read('curriculum.js')].join('\n')));
  template = replaceOnce(template, '/*APP_JS*/', safeScript([read('app.js'), read('calculator.js'), 'window.MathCalculator.init();', read('pets.js'), 'window.AtlasPets.init();', read('library-rewards.js')].join('\n')));
  return replaceOnce(template, '</body>', `<!-- Anatomy drawing toolkit. ${vendor('LICENSE')} -->\n</body>`);
}

export function renderAdventure({ baseOnly = false } = {}) {
  let template = read('adventure.template.html');
  template = replaceOnce(template, '/*ADVENTURE_CSS*/', [read('style.css'), vendor('iso.css'), read('reading-support.css'), read('calculator.css'), read('adventure.css'), read('pets.css')].join('\n'));
  const extension = baseOnly ? 'window.AtlasExtraContent=Object.freeze({extraMissions:[],extraTaskFor(){throw new RangeError("Choose a known mission.");}});' : browserModule('content-expansion.mjs', 'AtlasExtraContent');
  const code = [extension, browserModule('division-builder.mjs','AtlasDivisionBuilder'), browserModule('adventure-model.mjs', 'AtlasAdventure', 'const {extraMissions,extraTaskFor}=window.AtlasExtraContent;const {adaptTask}=window.AtlasDivisionBuilder;'), browserModule('curriculum-map.mjs','AtlasCurriculum','const {missions}=window.AtlasAdventure;'), browserModule('concepts-model.mjs', 'AtlasConcepts','const {extraMissions}=window.AtlasExtraContent;'), journeyModules(), read('reading-support.js'), read('calculator.js'), 'window.MathCalculator.init();', read('pets.js'), 'window.AtlasPets.init();', read('adventure.js')].join('\n');
  return replaceOnce(template, '/*ADVENTURE_JS*/', safeScript(code));
}

export function renderAbout() {
  let template = read('about.template.html');
  if (template.includes('/*ABOUT_CSS*/')) template = replaceOnce(template, '/*ABOUT_CSS*/', read('about.css'));
  return template;
}

export function build({ check = false } = {}) {
  const pages = { 'index.html': renderPage(), 'adventure.html': renderAdventure() };
  if (existsSync(resolve(root, 'src/about.template.html'))) pages['about.html'] = renderAbout();
  for (const [name, html] of Object.entries(pages)) {
    const destination = resolve(root, name);
    if (check) {
      if (!existsSync(destination) || readFileSync(destination, 'utf8').replace(/\r\n/g, '\n') !== html) {
        throw new Error(name + ' is out of date. Run npm run build and commit the generated pages.');
      }
    } else writeFileSync(destination, html, 'utf8');
  }
  if (!check) writeFileSync(resolve(root, '.nojekyll'), '', 'utf8');
  return Object.keys(pages);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  console.log((check ? 'Verified current build: ' : 'Built: ') + build({ check }).join(', '));
}
