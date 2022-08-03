import React from "react";
import axios from 'axios';
import { configuration } from "../config";

export const Uploader = () => {
    const [image, setImage] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [percent, setPercent] = React.useState(0);
    const [imageName, setImageName] = React.useState("Drop your video here!");
    const [videoURL, setVideoURL] = React.useState(null);

    const handleImage = event => {
        setImage(event.target.files[0]);
        setImageName(event.target.files[0].name);
        console.log(event.target.files[0])
    }

    const handleUploadImage = () => {
        let formData = new FormData();
        formData.append('image', image, image.name);
        const storage_data = JSON.parse(window.localStorage.getItem('credentials'));
        axios.post(`${configuration['host']}/upload/file/video`, formData, {
            headers: {
                "Authorization": storage_data['token'], 
                "Content-Type": "multipart/form-data",
                "Access-Control-Allow-Origin": "*"
            }, onUploadProgress: progress => setPercent(Math.round(progress.loaded / progress.total * 100))
        }).then(response => { if (response.data['success']) setLoading(!loading) })
        .catch(err => console.error(err));
    }

    return (
        <section className='section2'>
            <article className='art1'>
            <div className='image-drop-container'>
                <div className='cell'>
                <input className='cell-1' onChange={ handleImage } type="file" name="filename"/>
                <div className='icon'>
                    <i className="fas fa-cloud-upload-alt" id="cloud"></i>
                    <h1 className='title'>{ imageName.length > 24 ? imageName.substring(0, 20) + "..." : imageName }</h1>
                </div>
                </div>
            </div>
            </article>
        </section>
    );
}