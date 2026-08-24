import {checkEmpty} from "../general/checkEmpty.js";
import {secureRandomInteger} from "./secureRandomInteger.js";

export function secureRandomWeighted(object) {
    if (checkEmpty(object)) return undefined;
    const elements = Object.keys(object);
    const weights = Object.values(object);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomNum = secureRandomInteger(0, totalWeight);
    let weightSum = 0;
    for (let i = 0; i < elements.length; i++) {
        weightSum += weights[i];
        if (randomNum < weightSum) {
            return elements[i];
        }
    }
}
