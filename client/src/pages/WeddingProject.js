import React from 'react';
import { RWebShare } from "react-web-share";
import Carroussel from './Carrousel';
import { v4 as uuidv4 } from "uuid";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from './Card';
import { Loading } from './Loading';
import { configuration } from "../config";
import ImageGallery from 'react-image-gallery';
import ReactHlsPlayer from 'react-hls-player';
import axios from 'axios';
import { Helmet } from "react-helmet";

export const WeddingProject = () => {
    const projectName = useParams()['projectName'].replace(/_/g, " ");
    const navigate = useNavigate();
    const [slides, setSlides] = React.useState([]);
    const [photoGallery, setPhotoGallery] = React.useState({});
    const [projectTitle, setProjectTitle] = React.useState("");
    const [graphImage, setGraphImage] = React.useState('');
    const [videobackground, setVideoBackground] = React.useState("");
    const [cardsLoaded, setCardsLoaded] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [playList, setPlayList] = React.useState([]);
    const [fade, setFade] = React.useState(true)
    const [secured, setSecured] = React.useState(false);
    const [projPassword, setProjPassword] = React.useState("");

    React.useEffect(() => {
        axios.get(`${configuration['host']}/retrieve/project/${projectName}`)
        .then(response => {
            let responsee = response.data.data;
            setProjectTitle(responsee.title);
            setVideoBackground(responsee.videoBack);
            if (responsee.hasOwnProperty("secured")) setSecured(true);
            axios.post(`${configuration['host']}/project/auth`, {
                projectName: projectName
            }, { headers: { "Authorization": document.cookie.split('=')[1] }})
            .then(response => {
                if (response.data.auth) setSecured(false)
            }).catch(err => console.error(err))
            let dataObject = responsee.videos;
            let v1 = Object.keys(responsee.videos)[0];
            let p_1 = responsee.videos[v1]['portrait']
            let arr = [];
            for (let p in responsee.photos) 
                arr.push({
                    original: `${configuration['host']}/load/gallery/${projectName}/${p}`,
                    thumbnail: `${configuration['host']}/load/gallery/${projectName}/${p}`,
                })
            setPhotoGallery(arr);
            setGraphImage(`${configuration['host']}/load/poster/${projectName}/${p_1}`)
            var _slides = [], playList = []; 
            for (let i in dataObject) {
                if (dataObject[i].portrait !== "") {
                    let obj = {}; obj['project'] = projectName;
                    obj['video'] = i; playList.push(obj);
                    let object = new Object();
                    object['key'] = uuidv4();
                    object['content'] = <Card project={projectName} video={i} videoName={i.split(".")[0]} 
                        posterUrl={`${configuration['host']}/load/poster/${projectName}/${dataObject[i].portrait}`} />
                    _slides.push(object);
                }
            } setSlides(_slides); setPlayList(playList); 
            setTimeout(() => setCardsLoaded(true), 1000);
        }).catch(err => console.error(err));
    }, []);

    const playAllVideos = async () => {
        let array = JSON.stringify(playList);
        let proj = projectName.replace(/ /g, "_");
        navigate(`/player/${proj}/playlist/${btoa(array)}`);
    }

    const unlockProject = (ev) => {
        ev.preventDefault();
        axios.post(`${configuration['host']}/project/auth`, {
            projectName: projectName
        }, { headers: { "Authorization": projPassword }})
        .then(response => {
            if (response.data.auth) {
                setSecured(false);
                document.cookie = `passProject=${projPassword}`
            }
        }).catch(err => console.error(err))
    }
 
    if (!cardsLoaded) return <Loading/>
    else if (secured) return (
        <div style={{width:'100vw', height:'100vh', position:'fixed', zIndex:1000, top:0, left:0, 
        backgroundColor:'black', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
            <h1 style={{marginBottom:20, color:'white', fontSize:20}}>Please write the code to access this project:</h1>
            <form style={{display:'flex', alignItems:'center'}}>
                <input type="text" value={projPassword} autoFocus onChange={ev => setProjPassword(ev.target.value)} 
                style={{padding:'5px 20px', height:40, fontSize:20, backgroundColor:'white', borderRadius:5}}/>
                <input style={{height:40, border:'none', borderRadius:5, fontSize:15, padding:'5px 20px', marginLeft:10, backgroundColor:'#FF5200', 
                color:'white'}} type='submit' onClick={ unlockProject } value="Submit"/>
            </form>
        </div>
    ); else if (!secured) return (
        <React.Fragment>
            <Helmet>
                <title>{ projectName }</title>
                <meta charSet='utf-8'/>
                <meta name="description" content={ `Dale un vistazo a la ${projectName} y dinos que te parece!` } data-rh="true"/>
                <meta property="og:image" content={ graphImage } data-rh="true" />
                <meta property="og:image:secure_url" content={ graphImage } />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="640" />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:image" content={ graphImage } />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta name="robots" content="index"/>
                <meta name="robots" content={ projectName }/>
                <meta name="robots" content="max-image-preview:large"></meta>
            </Helmet>
            <section className='data-over-video'>
                <header className='header-number1'>
                <div onClick={() => navigate('/')}>
                    <img onClick={() => navigate('/')} className="logo-wedding" src={require("../media/LOGO-8A.png")}/>
                </div>
                    <div className='icons-container'>
                        <a onClick={() => setLoading(true)} href={`${configuration['host']}/download/${projectName}`} download>
                            <div><i className="fas fa-cloud-download-alt"></i></div>
                        </a>
                        <RWebShare data={{text: "Tus proyectos", url: `${configuration['mainHost']}/${projectName.replace(/ /g, "_")}`, title: `Mira de la ${projectName}`}}
                            onClick={() => console.log("shared successfully!")}>
                                <div> <i className="fas fa-share-alt"></i></div>
                        </RWebShare>
                    </div>
                </header>
                <article className="row-name">
                    <h1>{ projectTitle }</h1>
                    <div className='short'><p className='trailer'>Short Film</p></div>
                    <div onClick={ playAllVideos } className='play-all' >
                        <i className="far fa-play-circle"></i>
                        <p>Play all</p>
                    </div>
                </article>
                <article className="video-cards">
                <Carroussel
                    cards={slides}
                    height="500px"
                    width={ window.screen.width < 600 ? "90%" : "50%"  }
                    margin="0 auto"
                    offset={3}
                    showArrows={(window.screen.width < 600) && false}
                />
                </article>
            </section>
            <section className={fade ? 'fadeOut-gallery' : 'slider-gallery'}>
                    <div className='close-gallery' onClick={() => setFade(!fade)}>
                    <img src='https://flaticons.net/icon.php?slug_category=mobile-application&slug_icon=left-arrow'/>
                    </div>
                    <ImageGallery items={photoGallery} />
            </section>
            <h2 className='fotosButton' onClick={() => setFade(false)}>Explore the gallery</h2>
            <section className='sectionVideo'>
                <ReactHlsPlayer
                    src={ `${configuration['host']}/load/video/streaming/hls/${projectName}/${videobackground}/index_1080p.m3u8` }
                    autoPlay playsInline muted loop controls={ false }
                    style={{flex:1}}
                    width={ (window.screen.width > 600) && window.screen.width }
                    height={ (window.screen.height > 600) && window.screen.height }
                />
             *
             </section>
        </React.Fragment>
    );
}
