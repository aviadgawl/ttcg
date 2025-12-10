import { FC, useRef, useEffect } from 'react';
import { getSprite } from '../../helpers/sprite-helper';
import { spriteSettings, generalSettings } from './config';

const {spriteWidth, spriteHeight, staggerFrame} = generalSettings;

const getPosition = (gameFrame: number, staggerFrame: number, maxFrames: number) => {
    return Math.floor(gameFrame / staggerFrame) % maxFrames;
};

interface ChampionSpriteProps {
    width: number;
    height: number;
    animation: 'magic' | 'walk' | 'idle',
    direction: 'right' | 'left' | 'up' | 'down',
    championName: string,
    className: string
    onClick: () => void
};

const ChampionSprite: FC<ChampionSpriteProps> = (props) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const { maxFrames, y } = spriteSettings[props.animation][props.direction];
        const image = new Image();
        image.src = getSprite(props.championName, props.className);
        const canvas = canvasRef.current as any;

        if (canvas) {
            const ctx = canvas.getContext('2d');
            let gameFrame = 0;
            const animate = () => {
                ctx.clearRect(0, 0, props.width, props.height);
                const position = getPosition(gameFrame, staggerFrame, maxFrames);
                const frameX = spriteWidth * position;
                ctx.drawImage(image, frameX, y * spriteHeight, spriteWidth, spriteHeight, 0, 0, props.width, props.height);
                gameFrame++;
                requestAnimationFrame(animate);
            };

            animate();
        }
    }, [props.animation, props.direction, props.height, props.width, props.championName, props.className]);

    return <canvas onClick={props.onClick} ref={canvasRef} width={props.width} height={props.height} />;
};

export default ChampionSprite;