// All site copy lives here — edit this file to update the portfolio.

export const profile = {
  name: 'Neelabja Mukhopadhyay',
  initials: 'NM',
  // Taken from the git commit metadata — swap for whichever address you want public.
  email: 'neel.abja114@gmail.com',
  github: 'https://github.com/Ryzuuuu',
}

export const nowBuilding = [
  'AeroSense Edge: onboard AI for leaner flights',
  'TriSense: assistive sensing on a Raspberry Pi',
  'MemoryBot: a chatbot that never leaves your laptop',
]

// `accent` ties each section to the 3D object that opens it.
export const sections = [
  { id: 'about', label: 'About', accent: 'green', object: 'the monitor' },
  { id: 'projects', label: 'Projects', accent: 'blue', object: 'a gamepad' },
  { id: 'contact', label: 'Contact', accent: 'pink', object: 'the TV' },
]

export const stats = [
  { value: '30+', label: 'public repos' },
  { value: '2+', label: 'years building' },
  { value: '3', label: 'projects in progress' },
]

export const loadout = [
  { group: 'Languages', items: ['Python', 'JavaScript', 'Java', 'PHP', 'SQL'] },
  { group: 'AI & vision', items: ['PyTorch', 'YOLOv8', 'MediaPipe', 'OpenCV', 'Librosa'] },
  { group: 'Web & APIs', items: ['React', 'Three.js', 'FastAPI', 'Node.js', 'Tailwind'] },
  { group: 'Hardware & CAD', items: ['Raspberry Pi', 'pythonOCC', 'OpenSees', 'Docker'] },
]

export const projects = [
  {
    title: 'AeroSense Edge',
    genre: 'Edge AI · Aviation',
    status: 'In progress',
    blurb:
      'Planes carry extra fuel “just in case”, and burn fuel carrying it. Onboard AI that optimizes fuel and emissions in real time, on the aircraft instead of in the cloud.',
    tags: ['Python', 'Edge AI', 'Optimization'],
    repo: 'https://github.com/Ryzuuuu/AeroSenseEdge',
  },
  {
    title: 'TriSense',
    genre: 'Assistive · Embedded',
    status: 'In progress',
    blurb:
      'Three extra senses on a Raspberry Pi 4: ultrasonic spatial haptics, live subtitles that work offline, and 3D sign-language recognition. All low-latency, all on-device.',
    tags: ['PyTorch', 'MediaPipe', 'Vosk', 'Raspberry Pi'],
    repo: 'https://github.com/Ryzuuuu/TriSense',
  },
  {
    title: 'NeuroEcho',
    genre: 'Health AI · Audio',
    status: 'Shipped',
    blurb:
      'A 90-second voice clip from a cheap phone, screened for early signs of neurological decline using speech biomarkers like jitter, shimmer and pauses.',
    tags: ['FastAPI', 'PyTorch', 'Librosa', 'Docker'],
    repo: 'https://github.com/Ryzuuuu/NeuroEcho',
  },
  {
    title: 'StoreSight',
    genre: 'Vision · Retail',
    status: 'Shipped',
    blurb:
      'Raw CCTV footage in, live store analytics out: customer journeys, queue depth, conversion funnels and zone heatmaps.',
    tags: ['YOLOv8', 'ByteTrack', 'Re-ID', 'FastAPI'],
    repo: 'https://github.com/Ryzuuuu/StoreSight',
  },
  {
    title: 'PresentoVision',
    genre: 'Vision · HCI',
    status: 'Shipped',
    blurb:
      'Run your slides with your hands: open palm for next, fist to pause, two fingers for fullscreen. Works with anything that takes a keypress.',
    tags: ['OpenCV', 'MediaPipe', 'YOLOv8n'],
    repo: 'https://github.com/Ryzuuuu/PresentoVision',
  },
  {
    title: 'ParaBridge',
    genre: 'CAD · Civil',
    status: 'Shipped',
    blurb:
      'Change a few numbers, get a full steel girder bridge in 3D with IRC loading, IS 800 design checks and a STEP export. Built for FOSSEE Osdag.',
    tags: ['Python', 'pythonOCC', 'CAD'],
    repo: 'https://github.com/Ryzuuuu/ParaBridge',
  },
]

export const sideQuests = [
  { title: 'Fasal Sahaayak', note: 'Smart India Hackathon 2025 entry', repo: 'https://github.com/Ryzuuuu/Fasal-Sahaayak' },
  { title: 'OsdagBridge', note: 'Bridge analysis & design for Osdag (fork)', repo: 'https://github.com/Ryzuuuu/OsdagBridge' },
  { title: 'PrimeTrade API', note: 'FastAPI + JWT + role-based access', repo: 'https://github.com/Ryzuuuu/primetrade-assignment' },
  { title: 'This site', note: 'React Three Fiber, one compressed GLB', repo: 'https://github.com/Ryzuuuu/Ryzuuuu.github.io' },
]
