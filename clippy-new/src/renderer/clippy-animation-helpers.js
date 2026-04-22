"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomIdleAnimation = exports.getRandomAnimation = exports.EMPTY_ANIMATION = exports.IDLE_ANIMATION_KEYS = exports.ANIMATION_KEYS_BRACKETS = exports.ANIMATION_KEYS = void 0;
const clippy_animations_1 = require("./clippy-animations");
exports.ANIMATION_KEYS = Object.keys(clippy_animations_1.ANIMATIONS);
exports.ANIMATION_KEYS_BRACKETS = exports.ANIMATION_KEYS.map((k) => `[${k}]`);
exports.IDLE_ANIMATION_KEYS = exports.ANIMATION_KEYS.filter((k) => k.startsWith("Idle"));
exports.EMPTY_ANIMATION = {
    src: `data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`,
    length: 0,
};
/**
 * Get a random animation from the given keys'
 *
 * @param keys - The keys of the animations to choose from
 * @param current - The current animation
 * @returns A random animation from the given keys
 */
function getRandomAnimation(keys, current) {
    const randomIndex = Math.floor(Math.random() * keys.length);
    const randomAnimationKey = keys[randomIndex];
    const animation = clippy_animations_1.ANIMATIONS[randomAnimationKey];
    // If the random animation is the same as the current animation, get a new random animation
    if (current && animation === current) {
        return getRandomAnimation(keys, current);
    }
    return animation;
}
exports.getRandomAnimation = getRandomAnimation;
/**
 * Get a random idle animation
 *
 * @param current - The current animation
 * @returns A random idle animation
 */
function getRandomIdleAnimation(current) {
    return getRandomAnimation(exports.IDLE_ANIMATION_KEYS, current);
}
exports.getRandomIdleAnimation = getRandomIdleAnimation;
