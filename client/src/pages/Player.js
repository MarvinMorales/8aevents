import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactHlsPlayer from 'react-hls-player';
import { configuration } from "../config";

export const Player = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { video_to_play, playList } = useParams();
    const project = useParams()['project'].replace(/_/g, " ");
    const [playlist, setPlaylist] = React.useState([]);
    const [url, setUrl] = React.useState("");
    //const [next, setNext] = React.useState(1);
    const playerRef = React.useRef();

    const w = window.screen.width;
    const h = window.screen.height * .8;

    React.useEffect(() => {
        var _playList = [];
        if (playList !== undefined) {
            for (let i of JSON.parse(atob(playList))) 
                _playList.push(`${configuration['host']}/load/video/streaming/hls/${i['project']}/${i['video']}/index_1080p.m3u8`);
        } setPlaylist(_playList); setUrl(_playList[0]);
    }, []);

    if (playlist.length === 0) {
        return (
            <React.Fragment>
                <section style={{width:'100vw', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'black'}}>
                    <div className='close-gallery' onClick={() => navigate(`/${project}`)}>
                        <img src='https://flaticons.net/icon.php?slug_category=mobile-application&slug_icon=left-arrow'/>
                    </div>
                    {video_to_play.toLocaleLowerCase().includes("back") ? (
                        <ReactHlsPlayer
                        src={`${configuration['host']}/load/video/streaming/hls/${project}/${video_to_play}/index_1080p.m3u8`}
                        autoPlay controls
                        style={{flex:1}} onEnded={() => navigate(`/${project}`)}
                        width={ w }
                        height={ h }/>
                    ) : (
                        <iframe 
                        width="100%" 
                        height="100%" 
                        src={location.state.youtubeURL}
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen />
                    )}
                </section>
            </React.Fragment>
        );
    } else if (playlist.length !== 0) {
        return (
            <React.Fragment>
                <section style={{width:'100vw', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', backgroundColor:'black'}}>
                    <div className='close-gallery' onClick={() => navigate(`/${project}`)}>
                        <img src='https://flaticons.net/icon.php?slug_category=mobile-application&slug_icon=left-arrow'/>
                    </div>
                    <ReactHlsPlayer
                    src={ url }
                    autoPlay controls playerRef={playerRef}
                    style={{flex:1}}
                    width={ w }
                    height={ h }/>
                </section>
            </React.Fragment>
        );
    } 
}