import React from "react";
import { useNavigate } from 'react-router-dom';

export const Card = ({ 
    video, 
    posterUrl, 
    videoName, 
    project, 
    youtube }) => {
    const navigate = useNavigate();
    let proj = project.replace(/ /g, "_");
    return (
        <React.Fragment>
            <div className="card-container">
                <div className="poster-container">
                    <div className="i-div" onClick={() => navigate(`/player/${proj}/${video}`, {state: {youtubeURL: youtube}})}><i class="far fa-play-circle"></i></div>
                    <img className="poster" src={posterUrl} alt="testIMG"/>
                </div>
                <div className="footer-container">
                    <p className="title-wedding">{videoName}</p>
                    <div>
                        <p>Next video</p>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}