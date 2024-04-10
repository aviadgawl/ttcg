import { playerActionsName } from '../logic/player';
import { ChampionActionsName } from '../logic/champion';
import equipSound from '../assets/audio/equip.mp3';
import upgradeSound from '../assets/audio/upgrade.mp3';
import summonSound from '../assets/audio/summon.mp3';
import drawSound from '../assets/audio/draw.mp3';
import stepSound from '../assets/audio/step.mp3';
import basicHitSound from '../assets/audio/basic-hit.mp3';
import daggerThrowSound from '../assets/audio/dagger-throw.mp3';

const playSound = (soundFile: string) => {
    const audio = new Audio(soundFile);
    audio.play();
}

export const playSoundByPlayerActionName = (actionName: string) => {
    switch (actionName) {
        case playerActionsName.equip:
            playSound(equipSound);
            break;
        case playerActionsName.upgrade:
            playSound(upgradeSound);
            break;
        case playerActionsName.summon:
            playSound(summonSound);
            break;
        case playerActionsName.draw:
            playSound(drawSound);
            break;
        case playerActionsName.initialDraw:
            playSound(drawSound);
            break;
        default:
            break;
    }
}

export const playSoundByCardActionName = (actionName: string) => {
    switch (actionName) {
        case ChampionActionsName.BasicHit:
            playSound(basicHitSound);
            break;
        case ChampionActionsName.Step:
            playSound(stepSound);
            break;
        case ChampionActionsName.DaggerThrow:
            playSound(daggerThrowSound);
            break;
        default:
            break;
    }
}