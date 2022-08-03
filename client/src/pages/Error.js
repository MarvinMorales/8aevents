import React from "react";

export const Error = () => {
    return (
      <React.Fragment>
          <div style={{width:'100vw', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
              <img src={require("../media/notFound.jpg")} style={{width:'80%'}}/>
          </div>
      </React.Fragment>
    );
  }