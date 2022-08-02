import React from "react";
import { useNavigate } from 'react-router-dom';

export const Card = (props) => {
    const navigate = useNavigate();
    let proj = props.project.replace(/ /g, "_");
    return (
        <React.Fragment>
            <div className="card-container">
                <div className="poster-container">
                    <div className="i-div" onClick={() => navigate(`/player/${proj}/${props.video}`)}><i class="far fa-play-circle"></i></div>
                    <img className="poster" src={props.posterUrl} alt="testIMG"/>
                </div>
                <div className="footer-container">
                    <p className="title-wedding">{props.videoName}</p>
                    <div>
                        <p>Next video</p>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}