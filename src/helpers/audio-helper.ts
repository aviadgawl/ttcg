import { PlayerActionsName, ActionType } from '../logic/enums';
import equipSound from '../assets/audio/equip.mp3';
import upgradeSound from '../assets/audio/upgrade.mp3';
import summonSound from '../assets/audio/summon.mp3';
import drawSound from '../assets/audio/draw.mp3';
import stepSound from '../assets/audio/step.mp3';
import basicHitSound from '../assets/audio/basic-hit.mp3';
import daggerThrowSound from '../assets/audio/dagger-throw.mp3';
import buffSound from '../assets/audio/buff.mp3';
import magicAttack from '../assets/audio/magic-attack.mp3';
import turnStart from '../assets/audio/start-turn.mp3';
import armorDamage from '../assets/audio/armor-damage.mp3';
import hpDamage from '../assets/audio/hp-damage.mp3';

const playSound = (soundFile: string) => {
    const audio = new Audio(soundFile);
    audio.play();
}

export enum SoundEvents {
    startTurn = 0,
    hpDamage,
    armorDamage
}

export const playSoundByEvent = (eventName: SoundEvents) => {
    switch (eventName) {
        case SoundEvents.startTurn:
            playSound(turnStart);
            break;
        case SoundEvents.hpDamage:
            playSound(hpDamage);
            break;
        case SoundEvents.armorDamage:
            playSound(armorDamage);
            break;
        default:
            break;
    }
}

export const playSoundByPlayerActionName = (actionName: string) => {
    switch (actionName) {
        case PlayerActionsName.Equip:
            playSound(equipSound);
            break;
        case PlayerActionsName.Upgrade:
            playSound(upgradeSound);
            break;
        case PlayerActionsName.Summon:
            playSound(summonSound);
            break;
        case PlayerActionsName.InitialDraw:
        case PlayerActionsName.TurnDraw:
        case PlayerActionsName.Draw:
            playSound(drawSound);
            break;
        default:
            break;
    }
}

export const playSoundByCardActionName = (actionType: ActionType) => {
    switch (actionType) {
        case ActionType.Melee:
            playSound(basicHitSound);
            break;
        case ActionType.Magic:
            playSound(magicAttack);
            break;
        case ActionType.Ranged:
            playSound(daggerThrowSound);
            break;
        case ActionType.Movement:
            playSound(stepSound);
            break;
        case ActionType.Buff:
            playSound(buffSound);
            break;
        default:
            break;
    }
}