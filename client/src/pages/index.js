import React from "react";
import "../landingPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import card from "../media/ACT/card.json";
import { configuration } from "../config"
import Lottie from "lottie-react";
import axios from 'axios';

export const Index = () => {
    const [scTop, setscTop] = React.useState(0);
    const [wid, setWid] = React.useState(0);
    const [modal, setModal] = React.useState(false);
    const [toggle, setToggle] = React.useState(false);
    const [showProj, setShowProj] = React.useState(false);
    const [projects, setProjects] = React.useState([]);
    const navigate = useNavigate();
    const scrollSm = () => {
        window.scroll({
            top: wid > 600 ? window.screen.height : window.screen.height*.46,
            left: 0, 
            behavior: "smooth"
        });
    }

    React.useEffect(() => {
        setWid(window.screen.width)
        document.body.onscroll = () => setscTop(window.scrollY);
        axios.get(`${configuration['host']}/retrieve/projects`)
        .then(response => {
            var arr = [];
            response.data.data.forEach(item => {
                arr.push(item.project_name);
            }); setProjects(arr);
        }).catch(err => console.error(err))
    }, []);


    const showProjects = () => {
        let arr = [];
        projects.forEach(item => {
            arr.push(
                <div style={{width:'100%'}}>
                    <h4 onClick={() => navigate(`/${item}`)} 
                    className="h4Proj">{item}</h4>
                </div>
            );
        }); return arr;
    }

    return (
        <React.Fragment>
            <section className="modal-contact" style={{display:modal ? 'flex' : 'none'}}>
                <h3 className="closemodal" onClick={() => setModal(!modal)}>Close</h3>
                <div className="card-modal-contact">
                    <Lottie onClick={() => console.log(projects)} animationData={ card } loop={false} style={{width:'100%'}}/>
                </div>
            </section>

            <section className="modal-contact" style={{display:showProj ? 'flex' : 'none'}}>
                <h3 className="closemodal" style={{'&:hover':'cursor-pointer'}} onClick={() => setShowProj(!showProj)}>Close</h3>
                <div className="card-modal-contact">
                    { showProjects() }
                </div>
            </section>

            <section className="body-index">
                <header className="header_m" style={{width:'100vw', height:`${scTop > 200 ? 100 : 200}px`, 
                backgroundColor:`${scTop > 200 ? 'rgba(0,0,0,1)' : 'transparent'}`, transition:'.4s',
                borderBottom:`1px solid ${scTop > 200 ? 'rgba(255,255,255,0.1)' : 'transparent'}`}}>
                    <img id="logo1" src={require("../media/LOGO-8A.png")}/>
                    <uL>
                        <li onClick={() => {navigate('/'); setToggle(false)}}>Home</li>
                        <li onClick={ () => {setShowProj(!showProj); setToggle(false)}}>Projects</li>
                        <li onClick={() => {setModal(!modal); setToggle(false)}}>Contact</li>
                    </uL>
                        <uL className={!toggle ? "menu-cell" : "menu-cell-2"} style={{display: wid < 600 ? 'block' : 'none'}}>
                            <li onClick={() => {navigate('/'); setToggle(false)}}>Home</li>
                            <li onClick={ () => {setShowProj(!showProj); setToggle(false)}}>Projects</li>
                            <li onClick={() => {setModal(!modal); setToggle(false)}}>Contact</li>
                        </uL>
                    <img className="menuIcon" onClick={() => setToggle(!toggle)} src="https://www.pinclipart.com/picdir/big/532-5328945_menu-bar-icon-white-clipart-png-download-menu.png" style={{width:40}}/>
                </header>
                <article className="art1">
                    <div className="title1">
                        <h1 className="title_1">Photography, video & streaming</h1>
                        <h1 className="title_2">for social events</h1>
                        <h4 className="title_3">We specialize in documenting through
                            of the lens the most important details of
                            your event that you will treasure forever and you will be able to
                            share with your loved ones in real time.</h4>
                        <button onClick={ () => {setShowProj(!showProj); setToggle(false)}} className="button"><h4>Check our projects!</h4></button>
                    </div>
                    <img className="cam" style={{filter:`blur(${scTop*.009}px)`, transform:`translateY(${scTop*.5}px)`}} src={require("../media/cam.png")}/>
                    <img className="Chevron" style={{position:'absolute', bottom:30, zIndex:100, width:wid > 600 ? 40 : 20, left:'50%', transform:'translateX(-50%)'}} src="https://i0.wp.com/www.advizze.co/wp-content/uploads/2019/08/chevron-down-white.png?fit=219%2C154"/>
                </article>
                <article className="art2">
                <div className="about"><h1>Know more about us!</h1></div>
                    <div style={{
                        transform:wid > 600 ? 'scale(.7)' : 'scale(1)',
                        padding:wid > 600 ? '0' : '20px 0'
                    }}>
                    <section className="sec1" style={{marginTop:wid > 600 ? 0 : 20}}>
                            <div className="circle1" style={{
                                transform:`scale(${scTop > 500 ? 1 : 0})`, transition:'.3s'}}>
                                <div className="circle2">
                                    <div className="circlefoto">
                                        <img style={{width:'100%'}} src={require("../media/marcoPic.png")}/>
                                    </div>
                                </div>
                            </div>
                            <div className="texto1" style={{opacity:`${scTop > 500 ? 1 : 1}`, transition:'.5s'}}>
                                <div className="comill"><p>"</p></div>
                                <div className="tex">
                                    <span className="B1">CAPTURE WHAT HASN'T <br/>
                                    <span className="B2">BEEN CAPTURED <br/>
                                    <span className="B3">BEFORE</span></span></span>
                                </div>
                            </div>
                        <div className="texto2" style={{opacity:`${scTop > 500 ? 1 : 1}`, transition:'.5s'}}>
                            <div className="tex">
                                <h4 className="tex2">We are 8A events "photo/video" of events. Our photography and filming are emotional, spontaneous, photography that will never go out of style, that tomorrow will be shown as it was at that precise moment.</h4>
                                <a href="https://www.instagram.com/marcoochoaphotography/"><button className="inst">@marcoochoaphotography</button></a>
                            </div>
                        </div>
                    </section>

                    <section className="sec1" style={{marginTop:wid > 600 ? 20 : 40}}>
                        <div className="circle1" style={{
                            transform:`scale(${scTop > 500 ? 1 : 0})`, transition:'.3s', transitionDelay:'.1s'}}>
                            <div className="circle2">
                                <div className="circlefoto">
                                    <img style={{width:'100%'}} src={require("../media/gabrielPic.png")}/>
                                </div>
                            </div>
                        </div>
                        <div className="texto1" style={{opacity:`${scTop > 500 ? 1 : 1}`, transition:'.5s', transitionDelay:'.1s'}}>
                            <div className="comill"><p>"</p></div>
                            <div className="tex">
                                <span className="B1">EVERY EDITION IS A <br/>
                                <span className="B2">NEW STORY <br/>
                                <span className="B3">TO TELL</span></span></span>
                            </div>
                        </div>
                        <div className="texto2" style={{opacity:`${scTop > 500 ? 1 : 1}`, transition:'.5s', transitionDelay:'.1s'}}>
                            <div className="tex">
                                <h4 className="tex2">My name is Gabriel, I'm ecuadorian, for me it's a great responsability every project, that is why I make sure  I put all my creativity to capture in an unforgettable way the sories of our customers</h4>
                                <a href="https://www.instagram.com/buenequipo/"><button className="inst">@buenequipo</button></a>
                            </div>
                        </div>
                    </section>
                    </div>
                </article>
                <footer></footer>
            </section>
        </React.Fragment>
    );
}