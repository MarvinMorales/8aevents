import React from "react";
import { configuration } from '../config';
import axios from 'axios';
import './css/NewProject.css';
import { useNavigate } from 'react-router-dom';
import videoicon from "../images/videoicon.png"
import fot from "../images/folder.png"
import { Uploading } from "./Uploading";
import "./css/ModalCreateProject.css";

export const ModalCreateProject = () => {
    const [images, setImages] = React.useState([]);
    const [videos, setVideos] = React.useState([]);
    const [portadas, setPortadas] = React.useState([]);
    const [projectName, setProjectName] = React.useState("");
    const [backgroundVideo, setBackgroundVideo] = React.useState("");
    const [percent, setPercent] = React.useState(0);
    const [checkBoxBlocked, setCheckBox] = React.useState(true);
    const [selectedCheckbox, setSelectedCheckbox] = React.useState("");
    const [showUp, setShowUp] = React.useState(false);
    const [uploading, setUploading] = React.useState("");
    const navigate = useNavigate();

    const handleAddFiles = (event, type) => {
        var fileName = event.target.files[0].name;
        if (type === "foto") {
            let obj = new Object();
            obj['fileName'] = fileName;
            obj['file'] = event.target.files[0];
            setImages([...images, obj]);
        } else if (type === "video") {
            let obj = new Object();
            obj['fileName'] = fileName;
            obj['file'] = event.target.files[0];
            setVideos([...videos, obj]);
        }
    }

    const handleUploadImage = (objectImage) => {
        return new Promise(resolve => {
            const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
            let formData = new FormData();
            formData.append('image', objectImage.file, objectImage.file.name);
            formData.append('projectName', JSON.stringify({name: projectName}));
            axios.post(`${configuration['host']}/upload/file/image`, formData, {
                headers: {
                    "Authorization": storage_data['token'], 
                    "Content-Type": "multipart/form-data",
                }, onUploadProgress: progress => setPercent(Math.round(progress.loaded / progress.total * 100))
            }).then(response => { 
                if (response.data['success']) { resolve(true) }
                else if (response.status === 401) navigate("/") })
            .catch(err => console.error(err));
        })
    }

    const handleUploadVideo = (objectVideo) => {
        return new Promise(resolve => {
            const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
            let formData = new FormData();
            formData.append('video', objectVideo.file, objectVideo.file.name);
            formData.append('projectName', JSON.stringify({name: projectName}));
            axios.post(`${configuration['host']}/upload/file/video`, formData, {
                headers: {
                    "Authorization": storage_data['token'], 
                    "Content-Type": "multipart/form-data",
                }, onUploadProgress: progress => setPercent(Math.round(progress.loaded / progress.total * 100))
            }).then(response => { if (response.data['success']) { resolve(true) } })
            .catch(err => console.error(err)); 
        })
    }

    const handlePortraits = (objectVideo) => {
        return new Promise(resolve => {
            const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
            let datos = new Object();
            datos['name'] = projectName;
            datos['videoName'] = objectVideo.fileName;
            datos['portraitName'] = objectVideo.portraitName
            let formData = new FormData();
            formData.append('image', objectVideo.file, objectVideo.file.name);
            formData.append('projectName', JSON.stringify(datos)); axios.post(`${configuration['host']}/upload/file/portraits`, formData, {
                headers: {
                    "Authorization": storage_data['token'], 
                    "Content-Type": "multipart/form-data",
                }, onUploadProgress: progress => setPercent(Math.round(progress.loaded / progress.total * 100))
            }).then(response => { if (response.data['success']) { resolve(true) } })
            .catch(err => console.error(err)); 
        })
    }

    const sendDataToServer = () => {
        setShowUp(!showUp);
        const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
        let backgroundvideoName = backgroundVideo !== "" ? backgroundVideo : "default";
        axios.get(`${configuration['host']}/${storage_data['user_ID']}/create/project/${projectName}/${backgroundvideoName}`, {
            headers: { "Authorization": storage_data['token'] }
        }).then(async response => {
            if (response['data'].success) {
                for (let image of images) { setUploading(image.file.name); await handleUploadImage(image) }
                for (let video of videos) { setUploading(video.file.name); await handleUploadVideo(video) }
                for (let portada of portadas) { setUploading(portada.file.name); await handlePortraits(portada) }
            } setShowUp(!showUp); navigate('/dashboard')
        });
    }

    const deleteMediaItem = (name, type) => {
        if (type === "foto") {
            let elements = [...images];
            setImages(elements.filter(item => item['fileName'] !== name))
        } else if (type === "video") {
            let elements = [...videos];
            setVideos(elements.filter(item => item['fileName'] !== name))
        }
    }

    const FotosRows = () => {
        var arr = [];
        images.forEach((item, index) => {
            arr.push(
                <div key={ index } className="rows_" style={{borderLeft:`2px solid 
                ${selectedCheckbox === item['fileName'] ? 'rgb(56, 119, 255)' : 'transparent'}`}}>
                    <div className="cont-rows">
                        <i class="fa-solid fa-images" style={{fontSize:20, color:'rgba(0,0,0,0.5)'}}></i>
                        <p className="name-of-video">{ item['fileName'] }</p>
                    </div>
                    <div className="cont-2">
                        <span className="quite" onClick={ () => deleteMediaItem(item['fileName'], "foto")}>
                            <i class="fa-solid fa-trash-can-arrow-up plus-2"></i>
                        </span>
                    </div>
                </div>
            );
        }); return arr;
    }

    const VideosRows = () => {
        var arr = [];
        videos.forEach((item, index) => {
            arr.push(
                <div key={ index } className="rows_" style={{borderLeft:`2px solid 
                ${selectedCheckbox === item['fileName'] ? 'rgb(56, 119, 255)' : 'transparent'}`}}>
                    <div className="cont-rows">
                        <input type="checkbox" 
                        disabled={ selectedCheckbox === item['fileName'] || selectedCheckbox === "" ? false : true } 
                        onChange={ ev => {
                            if (!ev.target.checked && videos.length !== 0) {
                                let elements = [...videos];
                                elements.forEach(element => {
                                    delete element['backgroundProject'];
                                }); setVideos(elements)
                            } else if (ev.target.checked && videos.length > 0) {
                                setSelectedCheckbox(ev.target.checked ? item['fileName'] : "");
                                setCheckBox(ev.target.checked ? true : !checkBoxBlocked);
                                setBackgroundVideo(item['fileName'])
                                if (videos.includes(item)) item['backgroundProject'] = true;
                            }
                        } } className="checks"/>
                        <i class="fa-solid fa-film" style={{fontSize:20, color:'rgba(0,0,0,0.5)', marginLeft:10}}></i>
                        <p className="name-of-video">{ item['fileName'] }</p>
                    </div>
                    <div className="cont-2">
                        <div className="gridman" style={{position:'relative', opacity:selectedCheckbox === item['fileName'] ? 0 : 1}}>
                            <input onChange={ev => {
                                let obj = new Object();
                                obj['fileName'] = item['fileName'];
                                obj['file'] = ev.target.files[0];
                                obj['portraitName'] = ev.target.files[0].name;
                                setPortadas([...portadas, obj]);
                                let videoFiles = [...videos];
                                videoFiles.forEach(elem => {
                                    if (elem['fileName'] === item.fileName)
                                        elem['portadaName'] = ev.target.files[0].name;
                                }); setVideos(videoFiles);
                            }} type="file" disabled={ selectedCheckbox === item['fileName'] ? true : false } 
                            style={{position:'absolute', zIndex:10, width:'100%', height:'100%', opacity:0}} accept=".png, .jpeg, .jpg"/>
                            <p className="portada">Portada</p>
                        </div>
                        <span className="quite" onClick={ () => {
                            let elements = [...videos];
                            elements.forEach(element => {
                                if (element.hasOwnProperty('backgroundProject')) {
                                    delete element['backgroundProject'];
                                    setVideos(elements)
                                }
                            }); deleteMediaItem(item['fileName'], "video");
                            setCheckBox(selectedCheckbox === item['fileName'] ? false : checkBoxBlocked);
                            setSelectedCheckbox(() => { if (selectedCheckbox === item['fileName']) return "" });
                        } }>
                            <i class="fa-solid fa-trash-can-arrow-up plus-2"></i>
                        </span>
                    </div>
                </div>
            );
        }); return arr;
    }

    return (
        <React.Fragment>
            <div style={{width:'100vw', height:'100vh', display:showUp ? 'flex' : 'none', position:'absolute', zIndex:1000, top:0, left:0}}>
                <Uploading uploading={uploading} percent={percent}/>
            </div>
           <section className="box-1">
            <div className="nameProj">
                <input onChange={ev => setProjectName(ev.target.value)} type="text" placeholder="Ingresa el nombre del proyecto aqui..."/>
            </div>
           <section className="modal-body-section">
                <div style={{display:'flex', justifyConten:'center', alignItems:'center'}}>
                    <article className="articles">
                        <h3 className="tittle">VIDEOS DEL PROYECTO</h3>
                        <p className="subtitle">Cada video debe tener una portada</p>
                        <p className="subtitle">Debes seleccionar un video como video de background del proyecto (.mp4, .mov)</p>
                        <div id="line"></div>
                        { videos.length === 0 ?
                        <div style={{width:'100%', height:'60%', display:'flex', justifyContent:'center', alignItems:'center'}}>
                            <img src={videoicon} style={{width:'30%'}}/>
                        </div>
                        : VideosRows() }
                        <div className="filesButton">
                            <div style={{position:'relative', width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
                            <input type="file" className='fileSelector' accept='.mp4, .mov' 
                            onChange={ ev => handleAddFiles(ev, 'video') }/>
                            <i className="fa-solid fa-plus"></i>
                            </div>
                        </div>
                    </article>

                    <article className="articles">
                        <h3 className="tittle">FOTOS DEL PROYECTO</h3>
                        <p className="subtitle">En esta seccion debes Agregar la galeria de fotos del proyecto que vas a mostrar archvios permitidos (.png, .jpeg, .jpg)</p>
                        <div id="line"> </div>
                        { images.length === 0 ?
                        <div style={{width:'100%', height:'60%', display:'flex', backgroundColor:'rec', justifyContent:'center', alignItems:'center'}}>
                            <img src={fot} style={{width:'40%'}}/>
                        </div>
                        : FotosRows() }
                        <div className="filesButton">
                            <div style={{position:'relative', width:'100%', height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}>
                            <input type="file" className='fileSelector' accept='.jpg, .jpeg, .png' 
                            onChange={ ev => handleAddFiles(ev, 'foto') }/>
                            <i className="fa-solid fa-plus"></i>
                            </div>
                        </div>
                    </article>
                </div>

                <article className="buttons_bar">
                    <button className="buttons" onClick={() => navigate("/dashboard")}>Cancelar</button>
                    <button className="buttons" onClick={ sendDataToServer }>Crear Proyecto</button>
                </article>
            </section>
           </section>
        </React.Fragment>
    );
}