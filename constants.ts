import { Game } from './types';

export const GAMES: Game[] = [
  {
    id: '1',
    title: 'The Legend of Zelda: The Wind Waker',
    console: 'GameCube',
    year: '2002',
    size: '1.35 GB',
    format: 'ISO',
    description: 'An action-adventure game developed and published by Nintendo for the GameCube. The tenth installment in the Legend of Zelda series, it is set on a group of islands in a vast sea.',
    publisher: 'Nintendo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAquL5zMNavzyplHz9DcbY6ZD1yvo6bE54Ub-TTjNLtwBg5aPc_G2NF28LVllTsq1O3D-pJp86efTkihM_qRcKpUHZfTsFIOc2vS4WlmEpUGZdkY9YqBanupT34tnoqXGq531TH4MLvWbOaY8-HmHngwt6Ll2kOoVoPz1Mu5sMjurZ2qemck5tyuZHWWXRtfLv3acDn24NnyZ-pNBrfOe78B-bpKZC6doROGhy36cFMLQWlz2bNdHLavNq1xYc9cvaVObTfow61Vl-4',
    screenshots: [
        'https://images.igdb.com/igdb/image/upload/t_1080p/sc66a2.jpg',
        'https://images.igdb.com/igdb/image/upload/t_1080p/sc66a3.jpg',
        'https://images.igdb.com/igdb/image/upload/t_1080p/sc66a4.jpg'
    ],
    downloads: 12543,
    rating: 4.9,
    languages: ['Multi'],
    comments: [
      {
        id: 'c1',
        user: 'RetroGamer99',
        date: 'Oct 12, 2023',
        content: 'This runs perfectly on Dolphin! Verified dump confirmed.'
      },
      {
        id: 'c2',
        user: 'LinkFan',
        date: 'Nov 05, 2023',
        content: 'Best Zelda game visually, aged like fine wine.'
      }
    ]
  },
  {
    id: '2',
    title: 'The Legend of Zelda: Twilight Princess',
    console: 'GameCube',
    year: '2006',
    size: '1.10 GB',
    format: 'ISO',
    description: "A darker, more realistic entry in the series, featuring Link's transformation into a wolf and his journey through the Twilight Realm to save Hyrule.",
    publisher: 'Nintendo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAolCJKnI2UXEUNNn2kqmsrQcX83fpQbbmNXv1X6PUgthZLNLHaX7f0cQqc2zUmU_5qbkgwCkL-1LKI6Bn1XjHzrb4vkchPa-snJWvGoCnR47qiEAKe5nyMfDOhMcX5nTeyDBQL1nreRLh2vsdzefFx7XYHHk0GxR141X2DINa9LHHIEJdv3fR2HBO7B-tJ7nsPMWfCioP3_ZhTMgtx9qcfMqRhy_v8biz2ROIQMEGP_Vy-i3FA9HW2QcdJOkUbhAYmZetLjlnKnTuW',
    screenshots: [
        'https://images.igdb.com/igdb/image/upload/t_1080p/sc669w.jpg',
        'https://images.igdb.com/igdb/image/upload/t_1080p/sc669x.jpg'
    ],
    downloads: 9872,
    rating: 4.8,
    languages: ['English', 'Spanish'],
    comments: [
      {
        id: 'c3',
        user: 'MidnaStan',
        date: 'Jan 20, 2024',
        content: 'Thanks for the upload. Does this include the widescreen patch?'
      }
    ]
  },
  {
    id: '3',
    title: 'God of War II',
    console: 'PS2',
    year: '2007',
    size: '4.2 GB',
    format: 'ISO',
    description: 'Kratos returns in this critically acclaimed sequel. Use the Blades of Chaos to destroy your enemies in this action-packed journey.',
    publisher: 'Sony',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX8XGS6EbDwdPEm-gedY7cODlOhLGPmXXIa8vJBXMvFjYoFfgzwFTE3lu7M8oAIUiD4TtNVChUK1_VagNbtFDGryjZdQNWXnCA4IsLsc8wYbWj82VxtJOH6GeI157D5jUTUGKp4VLbrvh7HyMIteQmcJePUjV2_VHa9l46J7_v67RKVyPnm8xABiVyGWbKjGuCHYM1eXuF9xKvKwb1_Zjp36jxdSgs_KMoryJfcstfSq82HsbobB4vOK8veefA5hynf1kmzUgffAic',
    screenshots: [],
    downloads: 15400,
    rating: 4.9,
    languages: ['Multi']
  },
  {
    id: '4',
    title: 'Metroid Prime',
    console: 'GameCube',
    year: '2002',
    size: '1.4 GB',
    format: 'ISO',
    description: "Samus Aran's first 3D adventure. Explore the ruined world of Tallon IV and uncover the secrets of the Chozo.",
    publisher: 'Nintendo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWzTgxkxg80eb34xDcWu6jXpjYi5DT7445DQjL3mHr_sARLgwyNPdsd2pIzdFWoh_5fq-4wI-M6GYhdBcy_K4boOL1QUGLboOQ1zuFsHoiI-P9FGrCvaJL2OwIQ1ZeNIOlAT8jfzaC6MOvkxmfobOwCNbe5LYpSxmNg2o5VMgrcx8ejgoxg7HU15W_uo9Edwr8e67wkHQMPCgp3aItJgqj9MnUzOgQ_dpERRXbmvpvmX3eZIJxfqxyuV6i3xZXKBKUSeHyKjhiXWs',
    screenshots: [],
    downloads: 8230,
    rating: 4.7,
    languages: ['English']
  },
  {
    id: '5',
    title: 'Final Fantasy X',
    console: 'PS2',
    year: '2001',
    size: '3.8 GB',
    format: 'ISO',
    description: 'Join Tidus and Yuna on a pilgrimage to defeat Sin. Experience the first PS2 Final Fantasy with voice acting.',
    publisher: 'Square Enix',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQERZXxvaWWavILcByl_NFixsYxAuLFDj1T5-dO0RP_kClsfM9uTKJcO9jOpK5apRdk2OGqIHx9V0rEiHEX-MHg53_F-Z4xfWMx1fIKgHMc0BqrWiHL0Huvm6-HxgHUaMNinnOf1ffMo7ki3xzmBImTYoZtuKBHr0gdcCp04Y2KWacNpunmNBRFWsT6lIsjAl7Cyg8Rn5ntfWWV-vJaake-ed4NS2-7g0rb6etY4gDABzK4akgysFRU0jcoD6dsXEmrx6I14U55Tc5',
    screenshots: [],
    downloads: 18900,
    rating: 4.8,
    languages: ['Japanese', 'English']
  },
  {
    id: '6',
    title: 'The Legend of Zelda: Ocarina of Time',
    console: 'N64',
    year: '1998',
    size: '32 MB',
    format: 'Z64',
    description: 'Widely considered one of the greatest video games of all time. Control Link as he travels through time to stop Ganondorf from obtaining the Triforce.',
    publisher: 'Nintendo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaKf5lmHtpkZ4DqtCDHsy48Yg_H2g__xgniuyCwU-ojjhkcFswOOxt_UNLMhGUoS1om_2v5kMd2gG2lSDjzbU-x-sYs8j9QfEFWk3W2wuLv8FpbU2a5-nFdHEeRwrA50jX252DSfpqxGlkBe-onGYqmaGC3Eiyp-9MzHyO0RjkLMpQW6pd-dIrQAvLUQ49I4KSyV6yWb_-vcJ1z84Slboh6G4p__UmWSz6zqR9xB7brFqsFR0BSzl0hn73J76svDV55MBc0HqgvafO',
    screenshots: [],
    downloads: 32000,
    rating: 5.0,
    languages: ['Multi']
  },
  {
    id: '7',
    title: 'The Legend of Zelda: A Link to the Past',
    console: 'SNES',
    year: '1991',
    size: '4 MB',
    format: 'SMC',
    description: 'The third game in the series, returning to a top-down perspective. Link must travel between the Light World and the Dark World to defeat Ganon.',
    publisher: 'Nintendo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZZhVAaUhoAQV_HQ6B-U0O49m8ZPsElkOtgcqvjdWrnvs9mG1kn7K6IXEuRVzyX1SlFWq5Fr_tXjJQAu_yLI-bJ7xI31LzzgQZWyI7m3u8ljW1cq1Ehglcbb8tuvYbNdYYuaJZ5RDFGlPDOglZDanHl5V7_Lj6MzHciuf_MMrap9ojmBBHnJkr0defWRKdpDO_af_fLURJrBwxc5icw_7FHVKGFiGIKJDm5MpxDHBoPUbzp65B9leyHvO1SBnYojPQ_4DznlWbWzTU',
    screenshots: [],
    downloads: 24500,
    rating: 5.0,
    languages: ['English']
  },
  {
    id: '8',
    title: 'Golden Sun',
    console: 'GBA',
    year: '2001',
    size: '16 MB',
    format: 'GBA',
    description: 'The seal on Alchemy is broken. Four young Adepts set out to prevent the world from being consumed by its power.',
    publisher: 'Camelot',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_NmKaDf-RxVHsRqxhCFnefMhieJzFRel_g70gQxTYIXuAGos8xGMwZosMWGc7_pibu8df5FaVB5PE8ydCmhY65-sfjOJylq7TkLvOCBgOGfEbB0NLtPZ4LaoICqYeZ8Xv04VF0v0YP9EMa9pas6acjp8ip_T-tF1xhV-qEvwE0DCFXoNMhekkXkth2uwWP7AIIC-qTBspwzDAnly3e6y_pMb3T0X6AM1KUGtXLF52Hat-_xxK8W6vXr3bRmgO-X1S-8S4rgFBLLg6',
    screenshots: [],
    downloads: 6700,
    rating: 4.8,
    languages: ['Spanish']
  }
];