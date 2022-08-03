import React from 'react';
import { Uploader } from './Uploader';
import { configuration } from '../config';
import axios from 'axios';
import './css/NewProject.css';
import { useNavigate } from 'react-router-dom';

export const CreateProject = () => {
    const [projectData, setProjectData] = React.useState(null);
    const [images, setImages] = React.useState([]);
    const [videos, setVideos] = React.useState([]);
    const [projectName, setProjectName] = React.useState("");
    const [backgroundVideo, setBackgroundVideo] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [percent, setPercent] = React.useState(0);
    const navigate = useNavigate();

    const handleAddFiles = (event, type) => {
        if (type === "foto") setImages([...images, event.target.files[0]]);
        else if (type === "video") setVideos([...videos, event.target.files[0]]);
        console.log(images, videos)
    }

    const handleUploadImage = (file) => {
        const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
        const data = JSON.stringify({name: projectName});
        let formData = new FormData();
        formData.append('image', file, file.name);
        formData.append('projectName', data);
        axios.post(`${configuration['host']}/upload/file/image`, formData, {
            headers: {
                "Authorization": storage_data['token'], 
                "Content-Type": "multipart/form-data",
            }, onUploadProgress: progress => setPercent(Math.round(progress.loaded / progress.total * 100))
        }).then(response => { 
            if (response.data['success']) setLoading(!loading)
            else if (response.status === 401) navigate("/") })
        .catch(err => console.error(err));
    }

    const handleUploadVideo = (file) => {
        const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
        const data = JSON.stringify({name: projectName});
        let formData = new FormData();
        formData.append('video', file, file.name);
        formData.append('projectName', data);
        axios.post(`${configuration['host']}/upload/file/video`, formData, {
            headers: {
                "Authorization": storage_data['token'], 
                "Content-Type": "multipart/form-data",
            }, onUploadProgress: progress => setPercent(Math.round(progress.loaded / progress.total * 100))
        }).then(response => { if (response.data['success']) { setLoading(!loading) } })
        .catch(err => console.error(err)); 
    }

    const handleSendVideosPoster = () => {
        
    }

    const sendDataToServer = () => {
        const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
        axios.get(`${configuration['host']}/${storage_data['user_ID']}/create/project/${projectName}/${backgroundVideo}`, {
            headers: { "Authorization": storage_data['token'] }
        }).then(response => {
            if (response['data'].success) images.forEach(image => handleUploadImage(image));
        }).then(resp => videos.forEach(video => handleUploadVideo(video)))
    }

    const deleteMediaItem = (name, type) => {
        if (type === "foto") setImages(images.filter(item => item['name'] !== name))
        else if (type === "video") setVideos(images.filter(item => item['name'] !== name))
    }

    const FotosRows = () => {
        var arr = [];
        images.map(item => {
            arr.push(
                <div className='media-row-added'>
                    <div><i class="fas fa-photo-video"></i><p className='foto-name-added'>{ item.name }</p></div>
                    <i class="fas fa-trash-restore-alt trash" onClick={ () => deleteMediaItem(item.name, "foto") }></i>
                </div>
            );
        }); return arr;
    }

    const VideosRows = () => {
        var arr = [];
        videos.map(item => {
            arr.push(
                <div className='media-row-added'>
                    <div><i class="fas fa-video"></i><p className='foto-name-added'>{ item.name }</p></div>
                    <i class="fas fa-trash-restore-alt trash" onClick={ () => deleteMediaItem(item.name, "video") }></i>
                </div>
            );
        }); return arr;
    }

    return (
        <React.Fragment>
            <section className='c-section1'>
                <article className='c-left-article'>
                    <div className='row-input'>
                        <p className='floatingLabel' onClick={() => console.log(images)}>Nombre del proyecto</p>
                        <input type="text" className='inputs-text' onChange={ ev => setProjectName(ev.target.value) }/>
                    </div>

                    <div className='media-row'>
                        <div className='row-input'>
                            <p className='floatingLabel'>Selecciona fotos para el proyecto</p>
                            <p style={{fontStyle:'italic', color:'rgba(0,0,0,0.6)'}}>No obligatorio</p>
                        </div>
                        <div className='upload-fotos'>
                            <p>Agregar imagenes</p>
                            <input type="file" className='inputFile' accept='.png, .jpg, .jpeg' onChange={ ev => handleAddFiles(ev, 'foto') }/>
                        </div>
                    </div>
                    <div className='fotos-added'>
                        {FotosRows()}
                    </div>



                    <div className='media-row' style={{marginTop:50}}>
                        <div className='row-input'>
                            <p className='floatingLabel'>Selecciona videos para el proyecto</p>
                            <p style={{fontStyle:'italic', color:'rgba(0,0,0,0.6)'}}>Obligatorio para el proyecto</p>
                        </div>
                        <div className='upload-fotos'>
                            <p>Agregar videos</p>
                            <input type="file" className='inputFile' accept='.mp4, .mov' onChange={ ev => handleAddFiles(ev, 'video') }/>
                        </div>
                    </div>
                    <div className='fotos-added'>
                        {VideosRows()}
                    </div>


                    <button className='buttonFinal' onClick={ sendDataToServer }>Crear proyecto</button>
                </article>
            </section>
        </React.Fragment>
    );
}