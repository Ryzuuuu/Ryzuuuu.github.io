// All site copy lives here. The monitor's instruments read from this file too: they use
// `profile`, `tools`, and each project's `title` and `status`, plus each side project's `title`.
//
// House style: plain first person, a little dry. Say what a thing does the way you'd explain it
// to a friend, and leave code names and library internals to the monitor. Every claim should be
// traceable to a repo or a real experience, and admitting what went wrong is allowed.

export const profile = {
  name: 'Neelabja Mukhopadhyay',
  first: 'Neelabja',
  email: 'neel.abja114@gmail.com',
  github: 'https://github.com/Ryzuuuu',
  githubUser: 'Ryzuuuu',
}

export const intro = {
  lede: 'I build things that have to make sense of a camera, a microphone or a sensor, and then keep working once they leave my laptop.',
}

// The four chapters in the nav. Each is tied to a piece of the console: scrolling to the
// chapter swings the camera to that piece, and clicking the piece takes you to the chapter.
export const chapters = [
  { id: 'about', label: 'About' },
  { id: 'toolbox', label: 'Tools' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
]

// How a project goes, acted out by the model: wireframe, then broken apart, then put back together finished.
export const process = [
  {
    title: ['First,', 'make it run.'],
    body: 'The first version is ugly, but it goes all the way through. Camera in, keypress out. Until it does that, I can’t tell which part of the idea is the hard part, and it’s rarely the part I was worried about.',
  },
  {
    title: ['Then try', 'to break it.'],
    body: 'When I properly tested Fasal Sahaayak’s fertilizer model, it scored 14%, about what you’d get by guessing. A weather bug had also convinced another model that monsoon rice gets 38 mm of rain. It’s closer to 1,350. I took the fertilizer model out and wrote rules with a source behind every dose. Slightly embarrassing, very useful.',
  },
  {
    title: ['Then, finally,', 'make it nice.'],
    body: 'You just watched this console go from wireframe to pieces and back together, which is roughly how the site got built too. Polish comes last, so I don’t get attached to something broken.',
  },
]

export const about = {
  title: ['I point cameras', 'at hands.'],
  paragraphs: [
    'It started with a webcam: changing slides with an open palm, playing a piano in mid-air, catching falling balls with one finger. A lot of my debugging looks like waving at a laptop. TriSense is the one that stopped being a toy, a Raspberry Pi that reads 100 hand signs and says them out loud for someone who can’t.',
    'My internships involve less waving. At FOSSEE I work on Osdag, an open-source bridge design tool, generating the 3D models. At Travarsa I build AI agents and computer vision systems.',
  ],
  facts: [
    ['Studying', 'B.Tech CSE, VIT Bhopal'],
    ['Graduating', '2027'],
    ['Working in', 'Python, mostly'],
  ],
}

export const tools = [
  { verb: 'To see', items: ['OpenCV', 'MediaPipe', 'YOLOv8', 'ByteTrack'] },
  { verb: 'To hear', items: ['Librosa', 'Parselmouth', 'Vosk'] },
  { verb: 'To predict', items: ['PyTorch', 'LightGBM', 'XGBoost', 'scikit-learn'] },
  { verb: 'To reason', items: ['LangChain', 'LangGraph', 'llama.cpp'] },
  { verb: 'To serve', items: ['FastAPI', 'Flask', 'PostgreSQL', 'Docker'] },
  { verb: 'To show', items: ['React', 'Three.js', 'Vite'] },
  { verb: 'To make real', items: ['Raspberry Pi', 'pythonOCC', 'OpenSees'] },
]

// `instrument` is the page's caption for what the monitor runs (see canvas/instruments.js).
export const projects = [
  {
    id: 'trisense',
    title: 'TriSense',
    field: 'Assistive hardware',
    status: 'In progress',
    summary: 'Three modes, one Raspberry Pi, no internet.',
    body: 'For someone who can’t see, it senses obstacles and buzzes for longer as they get closer. For someone who can’t hear, it turns speech into captions on a tiny screen. For someone who can’t speak, a camera reads their hand signs and says them aloud. All of that on one small computer, which has opinions about it.',
    figure: { value: '100', note: 'hand signs it can read and say out loud' },
    stack: 'PyTorch, MediaPipe, Vosk, Raspberry Pi',
    instrument: 'How long until you hit it, and the buzz it would send',
    repo: 'https://github.com/Ryzuuuu/TriSense',
  },
  {
    id: 'fasal',
    title: 'Fasal Sahaayak',
    field: 'Agriculture',
    status: 'Rebuilt',
    summary: 'Crop advice for Odisha, in English, Hindi and Odia.',
    body: 'It started as a Smart India Hackathon 2025 entry. Later I tested the models properly, didn’t like the answer, and rebuilt most of it. Now every fertilizer dose links to its source, crops without a reliable dose just say so, and each yield forecast sits next to the simple estimate it barely beats. Farmers act on these numbers, so the app doesn’t get to bluff.',
    figure: { value: '14%', note: 'what the original model scored. It has since retired.' },
    stack: 'React, Flask, scikit-learn, NASA POWER data',
    instrument: 'What the checks found',
    repo: 'https://github.com/Ryzuuuu/Fasal-Sahaayak',
  },
  {
    id: 'neuroecho',
    title: 'NeuroEcho',
    field: 'Health',
    status: 'Prototype',
    summary: 'A voice screening test for places with no specialist nearby.',
    body: 'You read aloud on a phone or laptop. It listens for small changes in your voice that can be early signs of neurological decline, makes allowances for a cheap microphone, and answers green, yellow or red with a plain explanation. It isn’t a diagnosis, and it says so. Recordings are deleted as soon as they’ve been analysed.',
    figure: { value: '90 sec', note: 'of reading aloud is all it asks for' },
    stack: 'FastAPI, Parselmouth, XGBoost, SHAP',
    instrument: 'What it listens for, on a made-up voice',
    repo: 'https://github.com/Ryzuuuu/NeuroEcho',
  },
  {
    id: 'storesight',
    title: 'StoreSight',
    field: 'Retail',
    status: 'Complete',
    summary: 'Turns a shop’s CCTV clips into footfall and queue numbers.',
    body: 'It follows people around the shop and works out who went where, who joined the billing queue and who gave up on it. Staff are spotted by their uniform and left out of the counts. Otherwise the most loyal customer in the shop is always the cashier.',
    figure: { value: '8', note: 'kinds of event it logs, from walking in to giving up on the queue' },
    stack: 'YOLOv8, ByteTrack, FastAPI, SQLite',
    instrument: 'A made-up shop floor, counted as people move through it',
    repo: 'https://github.com/Ryzuuuu/StoreSight',
  },
  {
    id: 'aerosense',
    title: 'AeroSense Edge',
    field: 'Aviation',
    status: 'Simulation',
    summary: 'A fuel advisor that would ride on the aircraft.',
    body: 'Most fuel optimisation happens on the ground, before or after the flight. This is the idea of doing it in the air, with no link to the ground and the pilot still in charge. So far it has only flown in simulation: a virtual A320, minute by minute, with a model predicting the fuel burn and comparing ways of coming down.',
    figure: { value: '200', note: 'simulated flights and no real aircraft, which is probably for the best' },
    stack: 'LightGBM, OpenAP, FastAPI, React',
    instrument: 'A simulated A320, deciding when to come down',
    repo: 'https://github.com/Ryzuuuu/AeroSenseEdge',
  },
  {
    id: 'presento',
    title: 'PresentoVision',
    field: 'Gesture control',
    status: 'Complete',
    summary: 'Run a slide deck with one hand.',
    body: 'An open palm moves forward or back, a fist pauses, two fingers go fullscreen. It only sends ordinary key presses, so PowerPoint, Google Slides, Keynote and PDF viewers work without knowing it’s there. A short cooldown stops one enthusiastic wave from skipping three slides.',
    figure: { value: '4 of 6', note: 'frames have to agree before it believes a gesture' },
    stack: 'MediaPipe, OpenCV, YOLOv8n',
    instrument: 'Six frames voting on a gesture',
    repo: 'https://github.com/Ryzuuuu/PresentoVision',
  },
  {
    id: 'parabridge',
    title: 'ParaBridge',
    field: 'Bridge design',
    status: 'Complete',
    summary: 'A whole steel bridge, generated from one set of numbers.',
    body: 'Girders, deck, piers, foundations and reinforcement are all worked out from the same numbers, so changing the span moves everything that depends on it. You can export the model for CAD, or open it in a viewer where the concrete goes see-through. I wrote it to the requirements of Osdag’s bridge module.',
    figure: { value: '1', note: 'set of numbers, and every part of the bridge follows from it' },
    stack: 'pythonOCC, OpenCASCADE, PySide6',
    instrument: 'The span changing, and the bridge following',
    repo: 'https://github.com/Ryzuuuu/ParaBridge',
  },
]

export const sideProjects = [
  { title: 'NoteTouch', note: 'A piano played in the air. The left hand picks the scale.', repo: 'https://github.com/Ryzuuuu/NoteTouch' },
  { title: 'InvisiCloak', note: 'Frame a rectangle with both hands and see the empty room through it.', repo: 'https://github.com/Ryzuuuu/InvisiCloak' },
  { title: 'FingerFall', note: 'Catch falling balls with your index finger. Avoid the bombs.', repo: 'https://github.com/Ryzuuuu/FingerFall' },
  { title: 'MemoryBot', note: 'A chatbot running on my own machine, with five ways of remembering things to compare.', repo: 'https://github.com/Ryzuuuu/MemoryBot' },
  { title: 'Shortlist', note: 'CV screening and a client portal for a staffing firm.', repo: 'https://github.com/Ryzuuuu/Shortlist' },
  { title: 'Clock', note: 'A grandfather clock in React, with a swinging pendulum. Nobody asked.', repo: 'https://github.com/Ryzuuuu/Clock' },
]

export const contact = {
  title: ['Say hello.'],
  body: 'I graduate in 2027. If you’re working on something that has to survive outside a demo, or you’ve found what’s wrong with one of my projects, I’d like to hear about it.',
}
