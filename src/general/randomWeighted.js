import {checkEmpty} from "./checkEmpty.js";

export function randomWeighted(object) {
    if (checkEmpty(object)) return undefined;
    const elements = Object.keys(object);
    const weights = Object.values(object);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomNum = Math.random() * totalWeight;
    let weightSum = 0;
    for (let i = 0; i < elements.length; i++) {
        weightSum += weights[i];
        if (randomNum < weightSum) {
            return elements[i];
        }
    }
}
