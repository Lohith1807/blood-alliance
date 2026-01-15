// playerProfileUtils.js - Utilities for image mapping and data extraction

// Town Hall image mapping - using weserv.nl proxy to bypass CORS
export const getTownHallImage = (level) => {
    const baseProxy = 'https://images.weserv.nl/?url=';
    const townHallImages = {
        1: 'static.wikia.nocookie.net/clashofclans/images/f/fd/Town_Hall1.png/revision/latest/scale-to-width-down/200',
        2: 'static.wikia.nocookie.net/clashofclans/images/7/7d/Town_Hall2.png/revision/latest/scale-to-width-down/200',
        3: 'static.wikia.nocookie.net/clashofclans/images/d/dd/Town_Hall3.png/revision/latest/scale-to-width-down/200',
        4: 'static.wikia.nocookie.net/clashofclans/images/e/e7/Town_Hall4.png/revision/latest/scale-to-width-down/200',
        5: 'static.wikia.nocookie.net/clashofclans/images/a/a3/Town_Hall5.png/revision/latest/scale-to-width-down/200',
        6: 'static.wikia.nocookie.net/clashofclans/images/5/52/Town_Hall6.png/revision/latest/scale-to-width-down/200',
        7: 'static.wikia.nocookie.net/clashofclans/images/7/75/Town_Hall7.png/revision/latest/scale-to-width-down/200',
        8: 'static.wikia.nocookie.net/clashofclans/images/f/fa/Town_Hall8.png/revision/latest/scale-to-width-down/200',
        9: 'static.wikia.nocookie.net/clashofclans/images/e/e0/Town_Hall9.png/revision/latest/scale-to-width-down/200',
        10: 'static.wikia.nocookie.net/clashofclans/images/5/5c/Town_Hall10.png/revision/latest/scale-to-width-down/200',
        11: 'static.wikia.nocookie.net/clashofclans/images/9/96/Town_Hall11.png/revision/latest/scale-to-width-down/200',
        12: 'static.wikia.nocookie.net/clashofclans/images/b/b7/Town_Hall12.png/revision/latest/scale-to-width-down/200',
        13: 'static.wikia.nocookie.net/clashofclans/images/7/73/Town_Hall13.png/revision/latest/scale-to-width-down/200',
        14: 'static.wikia.nocookie.net/clashofclans/images/b/b6/Town_Hall14.png/revision/latest/scale-to-width-down/200',
        15: 'static.wikia.nocookie.net/clashofclans/images/d/d4/Town_Hall15.png/revision/latest/scale-to-width-down/200',
        16: 'static.wikia.nocookie.net/clashofclans/images/5/53/Town_Hall16.png/revision/latest/scale-to-width-down/200',
        17: 'static.wikia.nocookie.net/clashofclans/images/2/24/Town_Hall17-1.png/revision/latest/scale-to-width-down/200',
        18: 'static.wikia.nocookie.net/clashofclans/images/7/76/Town_Hall18.png/revision/latest/scale-to-width-down/200',
    };
    return townHallImages[level] ? `${baseProxy}${townHallImages[level]}` : null;
};

// Unit image mapping
export const getUnitImage = (name) => {
    const baseProxy = 'https://images.weserv.nl/?url=';
    const images = {
        // Heroes
        'Barbarian King': 'static.wikia.nocookie.net/clashofclans/images/2/26/Avatar_Hero_Barbarian_King.png',
        'Archer Queen': 'static.wikia.nocookie.net/clashofclans/images/b/b6/Avatar_Hero_Archer_Queen.png',
        'Grand Warden': 'static.wikia.nocookie.net/clashofclans/images/1/1d/Avatar_Hero_Grand_Warden.png',
        'Royal Champion': 'static.wikia.nocookie.net/clashofclans/images/8/8e/Avatar_Hero_Royal_Champion.png',
        'Minion Prince': 'static.wikia.nocookie.net/clashofclans/images/1/17/Avatar_Hero_Minion_Prince.png',

        // Troops
        'Barbarian': 'static.wikia.nocookie.net/clashofclans/images/8/87/Avatar_Barbarian.png',
        'Archer': 'static.wikia.nocookie.net/clashofclans/images/6/68/Avatar_Archer.png',
        'Giant': 'static.wikia.nocookie.net/clashofclans/images/7/7d/Avatar_Giant.png',
        'Goblin': 'static.wikia.nocookie.net/clashofclans/images/6/68/Avatar_Goblin.png',
        'Wall Breaker': 'static.wikia.nocookie.net/clashofclans/images/3/36/Avatar_Wall_Breaker.png',
        'Balloon': 'static.wikia.nocookie.net/clashofclans/images/8/80/Avatar_Balloon.png',
        'Wizard': 'static.wikia.nocookie.net/clashofclans/images/9/97/Avatar_Wizard.png',
        'Healer': 'static.wikia.nocookie.net/clashofclans/images/9/9c/Avatar_Healer.png',
        'Dragon': 'static.wikia.nocookie.net/clashofclans/images/9/9c/Avatar_Dragon.png',
        'P.E.K.K.A': 'static.wikia.nocookie.net/clashofclans/images/1/1a/Avatar_P.E.K.K.A.png',
        'Baby Dragon': 'static.wikia.nocookie.net/clashofclans/images/7/7a/Avatar_Baby_Dragon.png',
        'Miner': 'static.wikia.nocookie.net/clashofclans/images/7/7a/Avatar_Miner.png',
        'Electro Dragon': 'static.wikia.nocookie.net/clashofclans/images/9/97/Avatar_Electro_Dragon.png',
        'Yeti': 'static.wikia.nocookie.net/clashofclans/images/b/be/Avatar_Yeti.png',
        'Dragon Rider': 'static.wikia.nocookie.net/clashofclans/images/5/50/Avatar_Dragon_Rider.png',
        'Electro Titan': 'static.wikia.nocookie.net/clashofclans/images/6/67/Avatar_Electro_Titan.png',
        'Root Rider': 'static.wikia.nocookie.net/clashofclans/images/0/0b/Avatar_Root_Rider.png',
        'Thrower': 'static.wikia.nocookie.net/clashofclans/images/d/da/Avatar_Thrower.png',
        'Meteor Golem': 'static.wikia.nocookie.net/clashofclans/images/0/01/Avatar_Meteor_Golem.png',
        'Minion': 'static.wikia.nocookie.net/clashofclans/images/3/3b/Avatar_Minion.png',
        'Hog Rider': 'static.wikia.nocookie.net/clashofclans/images/e/e9/Avatar_Hog_Rider.png',
        'Valkyrie': 'static.wikia.nocookie.net/clashofclans/images/3/31/Avatar_Valkyrie.png',
        'Golem': 'static.wikia.nocookie.net/clashofclans/images/4/44/Avatar_Golem.png',
        'Witch': 'static.wikia.nocookie.net/clashofclans/images/9/90/Avatar_Witch.png',
        'Lava Hound': 'static.wikia.nocookie.net/clashofclans/images/1/1b/Avatar_Lava_Hound.png',
        'Bowler': 'static.wikia.nocookie.net/clashofclans/images/2/24/Avatar_Bowler.png',
        'Ice Golem': 'static.wikia.nocookie.net/clashofclans/images/7/79/Avatar_Ice_Golem.png',
        'Headhunter': 'static.wikia.nocookie.net/clashofclans/images/8/80/Avatar_Headhunter.png',
        'Apprentice Warden': 'static.wikia.nocookie.net/clashofclans/images/8/8b/Avatar_Apprentice_Warden.png',
        'Druid': 'static.wikia.nocookie.net/clashofclans/images/4/43/Avatar_Druid.png',
        'Furnace': 'static.wikia.nocookie.net/clashofclans/images/e/e0/Avatar_Furnace.png',

        // Spells
        'Lightning Spell': 'static.wikia.nocookie.net/clashofclans/images/c/c0/Lightning_Spell_info.png',
        'Healing Spell': 'static.wikia.nocookie.net/clashofclans/images/f/f2/Healing_Spell_info.png',
        'Rage Spell': 'static.wikia.nocookie.net/clashofclans/images/8/8a/Rage_Spell_info.png',
        'Jump Spell': 'static.wikia.nocookie.net/clashofclans/images/3/38/Jump_Spell_info.png',
        'Freeze Spell': 'static.wikia.nocookie.net/clashofclans/images/e/ef/Freeze_Spell_info.png',
        'Invisibility Spell': 'static.wikia.nocookie.net/clashofclans/images/a/a3/Invisibility_Spell_info.png',
        'Recall Spell': 'static.wikia.nocookie.net/clashofclans/images/7/73/Recall_Spell_info.png',
        'Revive Spell': 'static.wikia.nocookie.net/clashofclans/images/5/5f/Revive_Spell_info.png',
        'Totem Spell': 'static.wikia.nocookie.net/clashofclans/images/d/d1/Totem_Spell_info.png',
        'Clone Spell': 'static.wikia.nocookie.net/clashofclans/images/9/91/Clone_Spell_info.png',
        'Poison Spell': 'static.wikia.nocookie.net/clashofclans/images/4/49/Poison_Spell_info.png',
        'Earthquake Spell': 'static.wikia.nocookie.net/clashofclans/images/3/3f/Earthquake_Spell_info.png',
        'Haste Spell': 'static.wikia.nocookie.net/clashofclans/images/b/be/Haste_Spell_info.png',
        'Skeleton Spell': 'static.wikia.nocookie.net/clashofclans/images/0/0f/Skeleton_Spell_info.png',
        'Bat Spell': 'static.wikia.nocookie.net/clashofclans/images/3/3d/Bat_Spell_info.png',
        'Overgrowth Spell': 'static.wikia.nocookie.net/clashofclans/images/a/a6/Overgrowth_Spell_info.png',
        'Ice Block Spell': 'static.wikia.nocookie.net/clashofclans/images/6/66/Ice_Block_Spell_info.png',

        // Siege Machines
        'Wall Wrecker': 'static.wikia.nocookie.net/clashofclans/images/f/f3/Avatar_Wall_Wrecker.png',
        'Battle Blimp': 'static.wikia.nocookie.net/clashofclans/images/2/2f/Avatar_Battle_Blimp.png',
        'Stone Slammer': 'static.wikia.nocookie.net/clashofclans/images/a/ad/Avatar_Stone_Slammer.png',
        'Siege Barracks': 'static.wikia.nocookie.net/clashofclans/images/f/fe/Avatar_Siege_Barracks.png',
        'Log Launcher': 'static.wikia.nocookie.net/clashofclans/images/7/73/Avatar_Log_Launcher.png',
        'Flame Flinger': 'static.wikia.nocookie.net/clashofclans/images/e/e4/Avatar_Flame_Flinger.png',
        'Battle Drill': 'static.wikia.nocookie.net/clashofclans/images/9/99/Avatar_Battle_Drill.png',
        'Troop Launcher': 'static.wikia.nocookie.net/clashofclans/images/0/08/Avatar_Troop_Launcher.png',

        // Pets
        'L.A.S.S.I': 'static.wikia.nocookie.net/clashofclans/images/6/62/Avatar_L.A.S.S.I.png',
        'Electro Owl': 'static.wikia.nocookie.net/clashofclans/images/6/6e/Avatar_Electro_Owl.png',
        'Mighty Yak': 'static.wikia.nocookie.net/clashofclans/images/0/03/Avatar_Mighty_Yak.png',
        'Unicorn': 'static.wikia.nocookie.net/clashofclans/images/a/ac/Avatar_Unicorn.png',
        'Frosty': 'static.wikia.nocookie.net/clashofclans/images/e/e6/Avatar_Frosty.png',
        'Diggy': 'static.wikia.nocookie.net/clashofclans/images/6/6b/Avatar_Diggy.png',
        'Poison Lizard': 'static.wikia.nocookie.net/clashofclans/images/a/aa/Avatar_Poison_Lizard.png',
        'Phoenix': 'static.wikia.nocookie.net/clashofclans/images/4/4f/Avatar_Phoenix.png',
        'Spirit Fox': 'static.wikia.nocookie.net/clashofclans/images/5/52/Avatar_Spirit_Fox.png',
        'Angry Jelly': 'static.wikia.nocookie.net/clashofclans/images/3/3a/Avatar_Angry_Jelly.png',
        'Sneezy': 'static.wikia.nocookie.net/clashofclans/images/9/96/Avatar_Sneezy.png',
    };
    return images[name] ? `${baseProxy}${images[name]}/revision/latest/scale-to-width-down/120` : null;
};

// Robust League Icon Fetcher
export const getLeagueIcon = (playerData) => {
    if (!playerData) return null;
    const leagueData = playerData.league || playerData.leagueTier;
    if (!leagueData || !leagueData.iconUrls) return null;

    // Fallback order: medium -> large -> small
    return leagueData.iconUrls.medium ||
        leagueData.iconUrls.large ||
        leagueData.iconUrls.small;
};

// Derived categories
export const siegeMachineNames = ['Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks', 'Log Launcher', 'Flame Flinger', 'Battle Drill', 'Troop Launcher', 'Root Rider'];
export const petNames = ['L.A.S.S.I', 'Electro Owl', 'Mighty Yak', 'Unicorn', 'Frosty', 'Diggy', 'Poison Lizard', 'Phoenix', 'Spirit Fox', 'Angry Jelly', 'Sneezy'];

export const getLoot = (playerData, name) => {
    const achievement = playerData?.achievements?.find(a => a.name === name);
    return achievement ? achievement.value : 0;
};

export const getProgress = (list) => {
    if (!list || list.length === 0) return 0;
    const maxed = list.filter(i => i.level === i.maxLevel).length;
    return Math.round((maxed / list.length) * 100);
};
