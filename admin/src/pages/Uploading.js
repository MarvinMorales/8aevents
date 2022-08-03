import React from "react";

export const Uploading = (props) => {
    return (
        <React.Fragment>
            <section style={{width:'100%', height:'100%', backgroundColor:'rgba(255,255,255,0.9)', 
                display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                { !props.converting ? <h2>Uploading {props.uploading}</h2> : <h2>Converting...</h2> }
                <div style={{padding:'0 20px', marginTop:20, display:'flex', height:'20px', alignItems:'center', justifyContent:'center'}}>
                    <div style={{width:200, height:4, overflow:'hidden', position:'relative', 
                        borderRadius:2, backgroundColor:'rgba(0,0,0,0.1)'}}>
                        <div style={{height:'100%', width:`${props.percent*2}px`, position:'absolute', transition:'.3s', 
                        backgroundColor:'#11B0FF', left:0, top:0}}></div>
                    </div>
                    <p style={{marginLeft:10, fontSize:12, marginTop:'-2px'}}>{props.percent}<span style={{fontSize:10}}>%</span></p>
                </div>
            </section>
        </React.Fragment>
    );
}