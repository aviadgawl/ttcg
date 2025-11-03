import { FC } from 'react';
import * as motion from 'motion/react-client';

interface BounceProps {
    className?: string,
    children: React.ReactNode,
    isDisabled?: boolean
};

const animationConfig = {
    active: {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.95 }
    },
    disabled: {
        whileHover: { scale: 1 },
        whileTap: { scale: 1 }
    }
};

const Bounce: FC<BounceProps> = (props) => {
    const currentConfig = props.isDisabled ? animationConfig.disabled : animationConfig.active;

    return <motion.div className={props.className} whileHover={currentConfig.whileHover} whileTap={currentConfig.whileTap}>
        {props.children}
    </motion.div>
};

export default Bounce;