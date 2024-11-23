import React, { FC, useState } from 'react';
import { TextField, Button } from '@mui/material';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/firebase';
import { setIsLoggedIn } from '../../redux/store';
import { useAppDispatch } from '../../redux/hooks';
import styles from './Login.module.css';

const Login: FC = () => {
  const [password, setPassword] = useState<string|null>(null);
  const [email, setEmail] = useState<string|null>(null);
  const [emailError, setEmailError] = useState<string|null>(null);
  const [passwordError, setPasswordError] = useState<string|null>(null);

  const dispatch = useAppDispatch();

  const handleLoginClick = () => {
    if(!email) return setEmailError(`Email: ${email} not valid`);
    if(!password) return setPasswordError('Password not valid');

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        //const user = userCredential.user;
        dispatch(setIsLoggedIn(true));
      })
      .catch((error) => {
        console.log(`${error.code} ${error.message}`);
        alert(error.message);
      });
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }

  return <div className={styles.Login}>
    <TextField error={emailError !== null} helperText={emailError} required onChange={handleEmailChange} type="email" label="Email" />
    <TextField error={passwordError !== null} helperText={passwordError} required onChange={handlePasswordChange} type="password" label="Password" />
    <div>
      <Button onClick={handleLoginClick}>Login</Button>
    </div>
  </div>
};

export default Login;
