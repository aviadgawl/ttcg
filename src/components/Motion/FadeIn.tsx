import { FC } from 'react';
import * as motion from 'motion/react-client';

interface FadeInProps {
    className?: string,
    children: React.ReactNode
}

const FadeIn: FC<FadeInProps> = (props) => {
    return <motion.div className={props.className} initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
        }}>
        {props.children}
    </motion.div>
};

export default FadeIn;