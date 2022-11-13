import React, { memo, useCallback, useState, useEffect, useMemo } from "react";
import axios from "axios";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useNavigate } from "react-router-dom"; 
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { configuration } from "../config";

const Login = () => {
    const navigate = useNavigate();
    const emailHelper = "Ingresa un email válido";
    const emailRgx = useMemo(() => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, []);
    const { local, hostProd, hostDev, loginEndPoint } = configuration;
    const [emailError, setEmailError] = useState(false);
    const [credentials, setCredentials] = useState({email: "", password: ""});
    const baseUrl = local ? hostDev : hostProd; 
    const serverURL = `${baseUrl}${loginEndPoint}`;

    useEffect(() => {
        const { email } = credentials;
        if (email.match(emailRgx) && email !== "")
            setEmailError(false);
    }, [credentials, emailRgx]);

    const handleText = useCallback((event) => {
        const { target } = event;
        setCredentials({...credentials, [target.name]: target.value});
    }, [setCredentials, credentials]);

    const handleclick = useCallback((event) => {
        event.preventDefault();
        const { email, password } = credentials;
        if (email.match(emailRgx) && password !== "") {
            axios.post(serverURL, credentials, {
                headers: {"Content-Type": "application/json"}
                }).then(response => {
                    if (response.data.success) {
                        let userToken = response.headers['authorization'];
                        window.localStorage.setItem("8aeventsToken", userToken);
                        navigate("/main");
                    } else alert("Error de autenticacion!")
                }).catch(err => console.error(err));
        } else setEmailError(true);
    }, [credentials, navigate, serverURL, setEmailError, emailRgx]);

    return (
        <>
            <Dialog open className="py-3 px-4 flex flex-col">
                <form onSubmit={handleclick}>
                    <DialogContent sx={{display: 'flex', width:500, height:250, flexDirection: 'column'}}>
                        <TextField 
                            label="User" 
                            name="email"
                            required
                            type="email"
                            error={emailError}
                            helperText={emailError && emailHelper}
                            id="outlined-basic_1" 
                            sx={{marginBottom: 1}}
                            value={credentials?.email}
                            variant="outlined"
                            className="w-full"
                            onChange={handleText} 
                        />
                        <TextField 
                            label="Password" 
                            name="password" 
                            type="password"
                            required
                            id="outlined-basic_2" 
                            sx={{marginBottom: 1}}
                            value={credentials?.password}
                            variant="outlined"
                            className="w-full"
                            onChange={handleText} 
                        />
                        <Button sx={{height:50}} variant="contained" type="submit">
                            Iniciar sesión
                        </Button>
                    </DialogContent>
                </form>
            </Dialog>
        </>
    );
}

export default memo(Login);