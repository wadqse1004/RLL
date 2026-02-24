export const MAX_LEVEL = 100;
export const MAX_EXP = 60000;
export const EXPONENT = 1.8;
export const TIERS = ["아이언", "브론즈", "실버", "골드", "플래티넘", "에메랄드", "다이아몬드", "마스터", "그랜드마스터", "챌린저"];

export function getUserStats(totalExp: number) {
  let currentLevel = 1;
  for (let i = 1; i <= MAX_LEVEL; i++) {
    const req = Math.floor(MAX_EXP * Math.pow((i - 1) / (MAX_LEVEL - 1), EXPONENT));
    if (totalExp >= req) currentLevel = i;
    else break;
  }
  
  if (currentLevel === MAX_LEVEL) {
    return { level: MAX_LEVEL, tier: TIERS[9], currentLevelExp: 0, requiredExp: 0, progressPercent: 100 };
  }
  
  const currentLevelTotalExp = Math.floor(MAX_EXP * Math.pow((currentLevel - 1) / (MAX_LEVEL - 1), EXPONENT));
  const nextLevelTotalExp = Math.floor(MAX_EXP * Math.pow(currentLevel / (MAX_LEVEL - 1), EXPONENT));
  
  const currentLevelExp = totalExp - currentLevelTotalExp;
  const requiredExp = nextLevelTotalExp - currentLevelTotalExp;
  const progressPercent = Number(((currentLevelExp / requiredExp) * 100).toFixed(1));
  const tierName = TIERS[Math.floor((currentLevel - 1) / 10)];

  return { level: currentLevel, tier: tierName, currentLevelExp, requiredExp, progressPercent };
}