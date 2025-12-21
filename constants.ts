import { Game } from './types';

// Initialize as empty so we rely purely on Firestore data
export const GAMES: Game[] = [];

export interface EmulatorLink {
  name: string;
  url: string;
}

// Mapping of consoles to their recommended emulator download pages
// Now includes names for dynamic button display
export const CONSOLE_EMULATORS: Record<string, EmulatorLink | EmulatorLink[]> = {
  'Nintendo Switch': { name: 'Ryujinx', url: 'https://ryujinx.org/download' },
  'PlayStation 5': { name: 'RPCS3', url: 'https://rpcs3.net/' },
  'PlayStation 4': { name: 'ShadPS4', url: 'https://shadps4.net/' },
  'PC': { name: 'Steam Deck', url: 'https://www.steamdeck.com/' },
  'PlayStation 3': { name: 'RPCS3', url: 'https://rpcs3.net/download' },
  'Xbox 360': { name: 'Xenia', url: 'https://xenia.jp/download/' },
  'Wii U': { name: 'Cemu', url: 'https://cemu.info/' },
  'Wii': { name: 'Dolphin', url: 'https://dolphin-emu.org/download/' },
  'Nintendo 3DS': [
    { name: 'Citra', url: 'https://github.com/weihuoya/citra/releases' },
    { name: 'Azahar', url: 'https://azahar-emu.org/pages/download/' }
  ],
  'PlayStation 2': { name: 'PCSX2', url: 'https://pcsx2.net/downloads/' },
  'PS2': { name: 'PCSX2', url: 'https://pcsx2.net/downloads/' },
  'GameCube': { name: 'Dolphin', url: 'https://dolphin-emu.org/download/' },
  'Xbox': { name: 'Xemu', url: 'https://xemu.app/#download' },
  'Dreamcast': { name: 'Flycast', url: 'https://flycast.org/' },
  'PSP': { name: 'PPSSPP', url: 'https://www.ppsspp.org/downloads/' },
  'PS Vita': { name: 'Vita3K', url: 'https://vita3k.org/' },
  'Nintendo DS': { name: 'melonDS', url: 'https://melonds.kuribo64.net/' },
  'Nintendo 64': { name: 'Project64', url: 'https://www.pj64-emu.com/public-releases' },
  'SNES': { name: 'Snes9x', url: 'https://www.snes9x.com/' },
  'GBA': { name: 'mGBA', url: 'https://mgba.io/downloads.html' },
  'NES': { name: 'Mesen', url: 'https://www.mesen.ca/' },
  'Sega Genesis': { name: 'RetroArch', url: 'https://www.retroarch.com/' },
  'Saturn': { name: 'uOyaBauSe', url: 'https://www.uoyabause.org/' },
  'PS1': { name: 'DuckStation', url: 'https://duckstation.org/' }
};
