import React from 'react';
import "./css/ModalCreateProject.css";
import { configuration } from '../config';
import { useNavigate } from 'react-router-dom';
import { Uploading } from "./Uploading";
import axios from 'axios';

export const UploadZip = () => {
    const [fileZip, setFileZip] = React.useState("");
    const [uploading, setUploading] = React.useState("");
    const [percent, setPercent] = React.useState(0);
    const [showUp, setShowUp] = React.useState(false);
    const [nameFile, setnameFile] = React.useState("");
    const [converting, setConverting] = React.useState(false);
    const navigate = useNavigate();

    const handleUploadImage = () => {
        const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
            let formData = new FormData();
            setUploading(fileZip.name); setShowUp(!showUp);
            formData.append('zipFile', fileZip, fileZip.name);
            formData.append('projectData', JSON.stringify({userName: storage_data['user_name']}));
            axios.post(`${configuration['host']}/upload/file/zip`, formData, {
                headers: {
                    "Authorization": storage_data['token'], 
                    "Content-Type": "multipart/form-data",
                }, onUploadProgress: progress => {
                    setPercent(Math.round(progress.loaded / progress.total * 100));
                    if (Math.round(progress.loaded / progress.total * 100) === 100) setConverting(!converting);
                }}).then(response => { if (response.data['success']) { setShowUp(false); navigate('/dashboard') } })
            .catch(err => console.error(err));
    }

    return (
        <React.Fragment>
            <div style={{width:'100vw', height:'100vh', display:showUp ? 'flex' : 'none', position:'absolute', zIndex:1000, top:0, left:0}}>
                <Uploading uploading={uploading} percent={percent} converting={converting}/>
            </div>
                <div style={{width:350, height:'100%', display:'flex', position:'absolute', top:'50%', left:'50%', transform:'translateX(-50%) translateY(-50%)',
                 flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                    <div style={{width:'100%', position:'relative', height:200, borderRadius:20, display:'flex', justifyContent:'center', alignItems:'center', 
                    border:'6px dashed rgba(0,0,0,0.2)'}}>
                        <p style={{color:'rgba(0,0,0,0.2)', fontSize:20}}>{ nameFile === "" ? 'Seleccionar Archivo' : nameFile }</p>
                        <input type="file" style={{width:'100%', height:'100%', opacity:0, position:'absolute', zIndex:10}} onChange={ev => {
                            setFileZip(ev.target.files[0]); setnameFile(ev.target.files[0].name)
                        }} accept='.zip'/>
                    </div>
                    <input style={{width:'100%', height:60, marginTop:20, border:'none', border:'1px solid rgba(0,0,0,0.1)', borderRadius:5, background:'linear-gradient(to bottom, #EFEFEF, #C6C6C6)'}} 
                    onClick={() => handleUploadImage()} type="submit" value="SUBIR"/>
                </div>
                
        </React.Fragment>
    );
}