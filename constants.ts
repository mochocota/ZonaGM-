import { Game } from './types';

// Initialize as empty so we rely purely on Firestore data
export const GAMES: Game[] = [];

// Mapping of consoles to their recommended emulator download pages
// This allows global links per console across the entire site
export const CONSOLE_EMULATORS: Record<string, string> = {
  'Nintendo Switch': 'https://ryujinx.org/download',
  'PlayStation 5': 'https://rpcs3.net/', // PS5 emulation is experimental, mapping to common interest
  'PlayStation 4': 'https://shadps4.net/',
  'PC': 'https://www.steamdeck.com/',
  'PlayStation 3': 'https://rpcs3.net/download',
  'Xbox 360': 'https://xenia.jp/download/',
  'Wii U': 'https://cemu.info/',
  'Wii': 'https://dolphin-emu.org/download/',
  'Nintendo 3DS': 'https://citra-emu.org/download/',
  'PlayStation 2': 'https://pcsx2.net/downloads/',
  'PS2': 'https://pcsx2.net/downloads/',
  'GameCube': 'https://dolphin-emu.org/download/',
  'Xbox': 'https://xemu.app/#download',
  'Dreamcast': 'https://flycast.org/',
  'PSP': 'https://www.ppsspp.org/downloads/',
  'PS Vita': 'https://vita3k.org/',
  'Nintendo DS': 'https://melonds.kuribo64.net/',
  'Nintendo 64': 'https://www.pj64-emu.com/public-releases',
  'SNES': 'https://www.snes9x.com/',
  'GBA': 'https://mgba.io/downloads.html',
  'NES': 'https://www.mesen.ca/',
  'Sega Genesis': 'https://www.retroarch.com/',
  'Saturn': 'https://www.uoyabause.org/',
  'PS1': 'https://duckstation.org/'
};
