// Internationalization Dictionary (EN / VI) for Pian1st

export type Language = 'en' | 'vi';

export const translations = {
  en: {
    // Header & App Brand
    brandSubtitle: 'Live Piano Studio',
    songTitlePlaceholder: 'Song title...',
    toneLabel: 'Key:',
    presets: {
      theGioiHoanHao: 'Perfect World (Dm7-G7-Cmaj7-A7)',
      vanLuonLaAnh: 'Always You',
      khongBietGi: 'Know Nothing (Jazz Pop)',
      timEm: 'Find You',
    },
    audioSettingsTooltip: 'Audio Settings & Styles',
    virtualKeyboardTooltip: 'Virtual Piano Keyboard',

    // Hints Banner
    hintsTitle: 'Two-Handed Accompaniment:',
    leftHandHint: 'Left Hand: A S D F G H J K (Strike Chords)',
    rightHandHint: 'Right Hand: → / ↓ (Next Line) · ← / ↑ (Prev Line)',
    close: 'Close',

    // Audio Controls
    audioTitle: 'Audio Settings & Playing Styles',
    playingStyleLabel: 'Piano Playing Style',
    pianoTypeLabel: 'Piano Instrument Type',
    octaveLabel: 'Octave Range',
    octaveLow: 'Bass (2)',
    octaveHigh: 'Treble (5)',
    reverbLabel: 'Reverb Decay',
    reverbDry: 'Dry',
    reverbHall: 'Concert Hall',
    velocityLabel: 'Touch Velocity',
    velocitySoft: 'Soft',
    velocityMedium: 'Medium',
    velocityStrong: 'Strong',
    sustainLabel: 'Note Sustain',
    playingStyles: {
      arpeggio: { label: 'Ballad Arpeggio', desc: 'Smooth fingerpicking roll (38ms)' },
      pop: { label: 'Pop / R&B Syncopation', desc: 'Punchy 65ms offset rhythm' },
      bassFirst: { label: 'Bass-First Split', desc: 'Quinta bass 45ms before treble' },
      block: { label: 'Block Chord', desc: 'Simultaneous 3-4 note strike' },
    },
    pianoTypes: {
      grand: { label: 'Grand Piano', desc: 'Concert Steinway Model D' },
      upright: { label: 'Upright Piano', desc: 'Warm acoustic upright' },
      electric: { label: 'Electric Piano', desc: 'Classic vintage Rhodes' },
    },

    // Metronome & Loop Recorder
    metronomeTitle: 'Web Audio Metronome',
    metronomeToggleOn: 'Metronome ON',
    metronomeToggleOff: 'Metronome OFF',
    bpmLabel: 'BPM',
    recStart: 'Record & Loop',
    recStop: 'Finish & Start Loop',
    stopLoop: 'Stop Loop',
    clearLoop: 'Clear Loop',

    // Parser
    parserTitle: 'Import Chord Sheet from Hopamchuan',
    parserPlaceholder: 'Paste Hopamchuan text here...\nExample:\nVerse:\n[C]If we no [E7/G#]longer meet [Am]after breakup...\nChorus:\n[C]If we no [G/B]longer stay together...',
    parserButton: 'Parse & Load Progression',
    parserPreviewTitle: 'Preview Extracted Progression Blocks:',

    // Section Pad Group
    progressionLinesTitle: 'Song Progression Lines',
    rightHandNavHint: 'Use Right Hand → / ↓ to switch active line',
    activeLineTag: 'ACTIVE LEFT HAND (A S D F G H J K)',
    leftHandSectionTitle: 'Left Hand Pad Triggers',
    leftHandKeysHint: 'Keys: A S D F G H J K',
    addChord: 'Add Chord',
    addSection: 'Add Section',
    selectedTag: 'ACTIVE',
    uniqueChordsCount: 'Unique Chords',
    progressionLinesCount: 'Progression Lines',

    // Virtual Keyboard
    keyboardTitle: 'Virtual Piano Keyboard View',

    // Chord Selector Modal
    selectChordTitle: 'Select Chord',
    rootNote: 'Root Note',
    chordQuality: 'Chord Quality',
    bassNote: 'Bass Note (Slash Chord)',
    saveChord: 'Save Chord',
    cancel: 'Cancel',
  },
  vi: {
    // Header & App Brand
    brandSubtitle: 'Phòng Thu Piano Live',
    songTitlePlaceholder: 'Tên bài hát...',
    toneLabel: 'Tone:',
    presets: {
      theGioiHoanHao: 'Thế Giới Hoàn Hảo (Dm7-G7-Cmaj7-A7)',
      vanLuonLaAnh: 'Vẫn Luôn Là Anh',
      khongBietGi: 'Không Biết Gì (Jazz Pop)',
      timEm: 'Tìm Em',
    },
    audioSettingsTooltip: 'Điều chỉnh Âm thanh & Kiểu đệm',
    virtualKeyboardTooltip: 'Hiển thị Bàn phím ảo',

    // Hints Banner
    hintsTitle: 'Hướng dẫn đệm 2 tay:',
    leftHandHint: 'Tay Trái: A S D F G H J K (Đập Hợp Âm)',
    rightHandHint: 'Tay Phải: → / ↓ (Dòng tiếp) · ← / ↑ (Dòng trước)',
    close: 'Đóng',

    // Audio Controls
    audioTitle: 'Điều Chỉnh Âm Thanh & Kiểu Đệm',
    playingStyleLabel: 'Kiểu Đệm Piano (Playing Style)',
    pianoTypeLabel: 'Kiểu Đàn (Piano Type)',
    octaveLabel: 'Quãng Đàn (Octave)',
    octaveLow: 'Trầm (2)',
    octaveHigh: 'Cao (5)',
    reverbLabel: 'Độ Vang (Reverb)',
    reverbDry: 'Khô',
    reverbHall: 'Phòng HN',
    velocityLabel: 'Độ Mạnh (Velocity)',
    velocitySoft: 'Nhẹ',
    velocityMedium: 'Vừa',
    velocityStrong: 'Mạnh',
    sustainLabel: 'Độ Ngân (Sustain)',
    playingStyles: {
      arpeggio: { label: 'Ballad Rải Ngón', desc: 'Sâu lắng, rải ngón mượt (38ms)' },
      pop: { label: 'Pop / R&B Nảy Nhịp', desc: 'Bắt tai, nảy phách 65ms' },
      bassFirst: { label: 'Bass Nổ Trước', desc: 'Trầm Quinta trước 45ms' },
      block: { label: 'Dập Khối Chuẩn', desc: 'Nổ đồng thời cả khối 3-4 nốt' },
    },
    pianoTypes: {
      grand: { label: 'Grand Piano', desc: 'Steinway concert' },
      upright: { label: 'Upright Piano', desc: 'Acoustic upright' },
      electric: { label: 'Electric Piano', desc: 'Rhodes-style' },
    },

    // Metronome & Loop Recorder
    metronomeTitle: 'Metronome Web Audio',
    metronomeToggleOn: 'Metronome BẬT',
    metronomeToggleOff: 'Metronome TẮT',
    bpmLabel: 'BPM',
    recStart: 'Ghi Nhạc & Loop',
    recStop: 'Hoàn Thành & Loop Ngay',
    stopLoop: 'Dừng Loop',
    clearLoop: 'Xóa Loop',

    // Parser
    parserTitle: 'Nhập Hợp Âm Hopamchuan',
    parserPlaceholder: 'Ví dụ hopamchuan:\nVerse:\n[C]Nếu như ta [E7/G#]chẳng còn [Am]gặp lại nhau...\nChorus:\n[C]Nếu như ta [G/B]chẳng còn bên nhau...',
    parserButton: 'Phân Tích & Load Vòng Hợp Âm',
    parserPreviewTitle: 'Xem Trước Khối Vòng Hợp Âm:',

    // Section Pad Group
    progressionLinesTitle: 'Danh Sách Vòng Hợp Âm Bài Hát',
    rightHandNavHint: 'Dùng phím → / ↓ (Tay Phải) để chuyển vòng',
    activeLineTag: 'ĐANG ĐỆM TAY TRÁI (A S D F G H J K)',
    leftHandSectionTitle: 'Tay Trái Gõ Hợp Âm',
    leftHandKeysHint: 'Phím gõ Tay Trái: A S D F G H J K',
    addChord: 'Thêm Nốt',
    addSection: 'Thêm Đoạn',
    selectedTag: 'ĐANG CHỌN',
    uniqueChordsCount: 'Hợp Âm Độc Nhất',
    progressionLinesCount: 'Vòng Hợp Âm',

    // Virtual Keyboard
    keyboardTitle: 'Hiển Thị Bàn Phím Piano Ảo',

    // Chord Selector Modal
    selectChordTitle: 'Chọn Hợp Âm',
    rootNote: 'Nốt Chủ (Root Note)',
    chordQuality: 'Loại Hợp Âm (Quality)',
    bassNote: 'Nốt Bazo (Slash Bass)',
    saveChord: 'Lưu Hợp Âm',
    cancel: 'Hủy',
  },
} as const;
