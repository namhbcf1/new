// Import các tệp cấu hình AMD
import { configs as valorantConfigs } from './valorant.js';
import { configs as csgoConfigs } from './csgo.js';
import { configs as pubgConfigs } from './pubg.js';
import { configs as lolConfigs } from './lol.js';
import { configs as gtaVConfigs } from './gta-v.js';
import { configs as eldenRingConfigs } from './elden-ring.js';
import { configs as narakaConfigs } from './naraka.js';
import { configs as genshinConfigs } from './genshin.js';
import { configs as fo4Configs } from './fo4.js';
import { configs as blackMythWukongConfigs } from './black-myth-wukong.js';
import { configs as crossfireConfigs } from './crossfire.js';
import { configs as auditionConfigs } from './audition.js';
import { configs as battleTeams2Configs } from './battle-teams-2.js';
import { configs as deltaForceConfigs } from './delta-force.js';
import { configs as muOriginConfigs } from './mu-origin.js';

// Tạo đối tượng chứa tất cả cấu hình AMD
const configs = {
    valorant: valorantConfigs,
    csgo: csgoConfigs,
    pubg: pubgConfigs,
    lol: lolConfigs,
    'gta-v': gtaVConfigs,
    'elden-ring': eldenRingConfigs,
    naraka: narakaConfigs,
    genshin: genshinConfigs,
    fo4: fo4Configs,
    'black-myth-wukong': blackMythWukongConfigs,
    crossfire: crossfireConfigs,
    audition: auditionConfigs,
    'battle-teams-2': battleTeams2Configs,
    'delta-force': deltaForceConfigs,
    'mu-origin': muOriginConfigs,
};

// Debug log to check configs were loaded
console.log('AMD configs loaded:', Object.keys(configs).length, 'games');

// Export by default for module import
export default configs; 