import React from "react";
import axios from "axios";
import { configuration } from "./config";
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import LoadingButton from '@mui/lab/LoadingButton';
import {v4 as uuid} from "uuid"

export default function App() {
  const [openModal, setOpenModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [projectName, setProjectName] = React.useState("");
  const [videos, setVideos] = React.useState({name: "", url: ""});
  const [confirmedVideos, setConfirmedVideos] = React.useState([]);
  const [projects, setProjects] = React.useState([]);

  const RETRIEVE_PROJECTS = configuration.retrieveProjectsEndPoint;
  const ADD_YOUTUBE_VIDEOS = configuration.youtubeEndPoint;

  React.useEffect(() => {
    axios.get(`${configuration.host}/${RETRIEVE_PROJECTS}`)
    .then(response => {
      setProjects(response.data.data.map(e => e.project_name));
    }).catch(err => console.error(err));
  }, []);

  const handleTexts = (e) => setVideos({...videos, [e.target.name]: e.target.value});
  const handleAdd = (e) => {
    e.preventDefault();
    setConfirmedVideos([...confirmedVideos, {...videos, id: uuid()}])
  }

  const deleteThisRow = (identificator) => {
    const result = [...confirmedVideos].filter(elem => elem.id !== identificator);
    setConfirmedVideos(result);
  }

  const handleComplete = () => {
    setLoading(true);
    const finalData = {projectName, videos: confirmedVideos};
    axios.post(`${configuration.host}/${ADD_YOUTUBE_VIDEOS}`, { finalData })
    .then(response => {
      if (response.data.data) { handleDiscard(); setLoading(false); }
      else alert("Ha ocurrido un error!")
    }).catch(err => console.error(err));
  }

  const handleDiscard = () => {
    setConfirmedVideos([]);
    setProjectName("");
    setVideos({name: "", url: ""})
    setOpenModal(false)
  }

  const displayRows = () => {
    return confirmedVideos.map((elem, index) => (
      <div key={elem.id} className="flex items-center justify-between px-5 mb-3">
        <div className="py-2 px-4 flex items-center border border-gray-400 rounded mr-2">{index + 1}</div>
        <div className="py-2 overflow-x-scroll px-4 flex items-center border border-gray-400 rounded w-[40%]">{elem.name}</div>
        <div className="py-2 overflow-x-scroll px-4 flex items-center border ml-2 border-gray-400 rounded w-[40%]">{elem.url}</div>
        <Button onClick={() => deleteThisRow(elem.id)} variant="contained" sx={{textTransform: "capitalize", width:'12%', padding:'8px 6px', marginLeft:1}}>rem</Button>
      </div>
    ))
  }

  const mappingNames = () => {
    return projects.map((name, index) => (
      <div key={index} className="flex justify-between items-center my-1 hover:bg-slate-100">
        <p className="font-bold">{ name }</p>
        <Button onClick={() => {setOpenModal(true); setProjectName(name);}} variant="contained" size="small" sx={{textTransform: "initial"}}>Select</Button>
      </div>
    ));
  }

  return (
    <div className="App">
      <div className="w-1/4 h-full flex justify-center my-10 items-center mx-auto">  
        <section className="w-[1000px] h-auto flex-col justify-start overflow-y-scroll">
          {mappingNames()}
        </section>
      </div>

      <Dialog onClose={() => setOpenModal(false)} open={openModal} PaperProps={{style: {width: 1000}}}>
        <DialogContent>
          <DialogTitle id="alert-dialog-title">
            <p className="font-semibold text-gray-700" onClick={() => console.log(confirmedVideos)}>Ingresa los links de videos para este proyecto!</p>
            <Button startIcon={<AddIcon/>}variant="text" sx={{textTransform: "initial", padding:"6px 5px", fontSize:13}}>Agregar otro video</Button>
          </DialogTitle>
          <div>{displayRows()}</div>
          <div className="flex items-center justify-between px-5 mb-3 border-t border-t-gray-200 pt-4">
            <TextField sx={{marginRight:1}} name="name" onChange={handleTexts} autoFocus size="small" id="outlined-basic" label="Nombre del video" variant="outlined" />
            <TextField sx={{marginRight:0}} name="url" onChange={handleTexts} autoFocus size="small" id="outlined-basic" label="Video URL" variant="outlined" />
            <Button disabled={videos.name !== "" && videos.url !== "" ? false : true}  onClick={handleAdd} variant="contained" sx={{textTransform: "capitalize", padding:"7px 2px", marginLeft:2}}>Add</Button>
          </div>
          <div className="mt-4 px-5 mb-2">
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              variant="contained"
              onClick={handleComplete}
              sx={{textTransform: "capitalize", width:'49%', padding:"10px 50px"}}
            >
              Completar
            </LoadingButton>
            <Button variant="outlined" onClick={handleDiscard} sx={{textTransform: "capitalize", padding:"10px 100px", width:'49%', marginLeft:1}}>Descartar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
