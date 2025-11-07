import { FC } from 'react';
import * as motion from 'motion/react-client';

interface BounceProps {
    className?: string,
    children: React.ReactNode,
    isDisabled?: boolean
};

const Bounce: FC<BounceProps> = (props) => {
    if(props.isDisabled)
        return <>{props.children}</>;

    return <motion.div className={props.className} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        {props.children}
    </motion.div>
};

export default Bounce;