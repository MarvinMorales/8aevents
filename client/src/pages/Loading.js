import React from "react";
import Lottie from "lottie-react";
import loading from "../media/loading.json";

export const Loading = () => {
    return (
        <React.Fragment>
            <section style={{backgroundColor:'#000', widht:'100vw', height:'100vh',
            display:'flex', justifyContent:'center', alignItems:'center'}}>
                <Lottie animationData={ loading } loop style={{width:120}} />
            </section>
        </React.Fragment>
    );
}