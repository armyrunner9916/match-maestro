import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

// Load every persisted slice in parallel. Returns an object with `null` for any
// slice that wasn't present so callers can apply their own defaults.
export async function loadAllData() {
  try {
    const [savedScores, savedSettings, savedPremium] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.highScores),
      AsyncStorage.getItem(STORAGE_KEYS.settings),
      AsyncStorage.getItem(STORAGE_KEYS.premium),
    ]);
    return {
      highScores: savedScores ? JSON.parse(savedScores) : null,
      settings: savedSettings ? JSON.parse(savedSettings) : null,
      isPremium: savedPremium ? JSON.parse(savedPremium) : null,
    };
  } catch (error) {
    console.error('Error loading game data:', error);
    return { highScores: null, settings: null, isPremium: null };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export async function saveHighScores(scores) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.highScores, JSON.stringify(scores));
  } catch (error) {
    console.error('Error saving high scores:', error);
  }
}

export async function savePremium(isPremium) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.premium, JSON.stringify(isPremium));
  } catch (error) {
    console.error('Error saving premium status:', error);
  }
}
