// All site copy lives here — edit this file to update the portfolio.

export const profile = {
  name: 'Neelabja Mukhopadhyay',
  short: 'neelabja m.',
  initials: 'NM',
  // Taken from the git commit metadata — swap for whichever address you want public.
  email: 'neel.abja114@gmail.com',
  github: 'https://github.com/Ryzuuuu',
}

export const onTheBench = [
  'AeroSense Edge, onboard AI for leaner flights',
  'TriSense, three extra senses on a Raspberry Pi',
  'MemoryBot, a chatbot that never leaves your laptop',
]

// The four chapters in the nav. Each is tied to a piece of the console: scrolling to the
// chapter swings the camera to that piece, and clicking the piece takes you to the chapter.
export const chapters = [
  { id: 'about', num: '01', label: 'About', piece: 'the monitor' },
  { id: 'toolbox', num: '02', label: 'Toolbox', piece: 'the console' },
  { id: 'work', num: '03', label: 'Work', piece: 'the controllers' },
  { id: 'contact', num: '04', label: 'Contact', piece: 'the antenna' },
]

// "How I work", told by the model itself: wireframe → clay → finished.
export const process = [
  {
    step: 'Step one',
    title: ['Make it', 'work.'],
    body: 'Ugly is allowed. Wrong isn’t. The first version runs end to end, even if it’s mostly print statements and hope.',
    note: 'Pictured: the console, as a wireframe. It boots. That’s about it.',
  },
  {
    step: 'Step two',
    title: ['Make it', 'survive', 'reality.'],
    body: 'Real webcams shake. Real audio hisses. Real Raspberry Pis get warm and sulk. Version two has met all of them and kept working.',
    note: 'Pictured: grey clay. Solid, honest, no makeup yet.',
  },
  {
    step: 'Step three',
    title: ['Then make it', 'beautiful.'],
    body: 'Only now am I allowed to pick fonts. You’re scrolling through the result of exactly this rule.',
    note: 'Pictured: the finished thing. Colour, light, the works.',
  },
]

export const stats = [
  { value: 30, suffix: '+', label: 'public repos', short: 'repos' },
  { value: 2, suffix: '+', label: 'years of shipping things', short: 'years' },
  { value: 3, suffix: '', label: 'projects mid-flight right now', short: 'in flight' },
]

export const loadout = [
  { group: 'Languages', aside: 'the ones I think in', items: ['Python', 'JavaScript', 'Java', 'PHP', 'SQL'] },
  { group: 'AI & vision', aside: 'teaching pixels to talk', items: ['PyTorch', 'YOLOv8', 'MediaPipe', 'OpenCV', 'Librosa'] },
  { group: 'Web & APIs', aside: 'where everything ends up', items: ['React', 'Three.js', 'FastAPI', 'Node.js', 'Tailwind'] },
  { group: 'Hardware & CAD', aside: 'things with screws in them', items: ['Raspberry Pi', 'pythonOCC', 'OpenSees', 'Docker'] },
]

export const projects = [
  {
    title: 'AeroSense Edge',
    quip: 'Less fuel, same sky.',
    genre: 'Edge AI · Aviation',
    status: 'In progress',
    blurb:
      'Planes carry extra fuel “just in case”, then burn fuel carrying it. This is onboard AI that tunes fuel and emissions in real time, on the aircraft, not in some cloud on the ground.',
    tags: ['Python', 'Edge AI', 'Optimization'],
    repo: 'https://github.com/Ryzuuuu/AeroSenseEdge',
  },
  {
    title: 'TriSense',
    quip: 'Three extra senses. One Pi.',
    genre: 'Assistive · Embedded',
    status: 'In progress',
    blurb:
      'Ultrasonic spatial haptics, live subtitles that work offline, and 3D sign-language recognition, all on a Raspberry Pi 4. Low latency, no internet required, no excuses.',
    tags: ['PyTorch', 'MediaPipe', 'Vosk', 'Raspberry Pi'],
    repo: 'https://github.com/Ryzuuuu/TriSense',
  },
  {
    title: 'NeuroEcho',
    quip: 'Ninety seconds. One cheap phone.',
    genre: 'Health AI · Audio',
    status: 'Shipped',
    blurb:
      'Talk into a budget phone for 90 seconds and it screens your voice for early signs of neurological decline, listening for jitter, shimmer and the pauses you didn’t notice you made.',
    tags: ['FastAPI', 'PyTorch', 'Librosa', 'Docker'],
    repo: 'https://github.com/Ryzuuuu/NeuroEcho',
  },
  {
    title: 'StoreSight',
    quip: 'CCTV that finally earns its keep.',
    genre: 'Vision · Retail',
    status: 'Shipped',
    blurb:
      'Raw CCTV footage in, live store analytics out: customer journeys, queue depth, conversion funnels and heatmaps of where people actually linger.',
    tags: ['YOLOv8', 'ByteTrack', 'Re-ID', 'FastAPI'],
    repo: 'https://github.com/Ryzuuuu/StoreSight',
  },
  {
    title: 'PresentoVision',
    quip: 'Your hand is the clicker now.',
    genre: 'Vision · HCI',
    status: 'Shipped',
    blurb:
      'Open palm for next slide, fist to pause, two fingers for fullscreen. Works with anything that listens to a keypress, so, most things.',
    tags: ['OpenCV', 'MediaPipe', 'YOLOv8n'],
    repo: 'https://github.com/Ryzuuuu/PresentoVision',
  },
  {
    title: 'ParaBridge',
    quip: 'Type some numbers. Get a bridge.',
    genre: 'CAD · Civil',
    status: 'Shipped',
    blurb:
      'Change a few parameters and out comes a full steel girder bridge in 3D, with IRC loading, IS 800 design checks and a STEP export. Built for FOSSEE Osdag.',
    tags: ['Python', 'pythonOCC', 'CAD'],
    repo: 'https://github.com/Ryzuuuu/ParaBridge',
  },
]

export const sideQuests = [
  { title: 'Fasal Sahaayak', note: 'Smart India Hackathon 2025 entry', repo: 'https://github.com/Ryzuuuu/Fasal-Sahaayak' },
  { title: 'OsdagBridge', note: 'Bridge analysis & design for Osdag. A fork, for now.', repo: 'https://github.com/Ryzuuuu/OsdagBridge' },
  { title: 'PrimeTrade API', note: 'FastAPI, JWT and role-based access. An assignment, taken slightly too seriously.', repo: 'https://github.com/Ryzuuuu/primetrade-assignment' },
  { title: 'This site', note: 'You are standing in it. Mind the antenna.', repo: 'https://github.com/Ryzuuuu/Ryzuuuu.github.io' },
]
