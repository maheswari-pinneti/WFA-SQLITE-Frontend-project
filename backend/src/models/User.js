import { ModelShim } from './modelShim.js';

export const User = new ModelShim('users');
export const MfaChallenge = new ModelShim('mfachallenges');

export default User;
