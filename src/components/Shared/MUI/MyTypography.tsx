import { FC } from 'react';
import { Typography, TypographyProps } from '@mui/material';

const typographyFontSize = {
    fontSize: {
        xs: '0.6rem', // extra-small screens (mobile)
        sm: '1.2rem', // small screens (tablet)
        md: '1.1rem', // medium screens (desktop)
    }
};

const MyTypography: FC<TypographyProps> = (props) => {
    
    return <Typography {...props} sx={typographyFontSize} />
};

export default MyTypography;