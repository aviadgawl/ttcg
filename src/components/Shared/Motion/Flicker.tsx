import { FC } from 'react';
import * as motion from 'motion/react-client';

interface FlickerProps {
    className?: string,
    children: React.ReactNode,
    isDisabled?: boolean
};

const Flicker: FC<FlickerProps> = (props) => {
    if(props.isDisabled)
        return <>{props.children}</>;

    return <motion.div style={{height: '100%'}} className={props.className} 
    initial={{ opacity: 1 }}
    animate={{ opacity: [1, 0.5, 1] }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }}>
        {props.children}
    </motion.div>
};

export default Flicker;