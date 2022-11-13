import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { configuration } from "../config";
import { useNavigate } from "react-router-dom";
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import LoadingButton from '@mui/lab/LoadingButton';
import { v4 as uuid } from "uuid"

export default function Main() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [videos, setVideos] = useState({name: "", url: "", portraitName: ""});
  const [confirmedVideos, setConfirmedVideos] = useState([]);
  const [projects, setProjects] = useState([]);

  const RETRIEVE_PROJECTS = configuration.retrieveProjectsEndPoint;
  const ADD_YOUTUBE_VIDEOS = configuration.youtubeEndPoint;
  const { hostDev, hostProd, local } = configuration;
    const baseUrl = local ? hostDev : hostProd;
  
  useEffect(() => {
    const userToken = window.localStorage.getItem("8aeventsToken");
    if (userToken === null || userToken === undefined) navigate("/");
    axios.get(`${baseUrl}${RETRIEVE_PROJECTS}`)
    .then(response => {
      const { data } = response?.data;
      setProjects(data.map(item => item.project_name));
    }).catch(err => console.error(err));
  }, [RETRIEVE_PROJECTS, baseUrl, navigate]);

  const handleTexts = useCallback((event) => {
    const { target } = event;
    setVideos({...videos, [target.name]: target.value});
  }, [videos, setVideos]);

  const handleAdd = useCallback((event) => {
    event.preventDefault();
    setConfirmedVideos([...confirmedVideos, {...videos, id: uuid()}])
  }, [videos, confirmedVideos, setConfirmedVideos]);

  const deleteThisRow = useCallback((identificator) => {
    const result = [...confirmedVideos]
    .filter(elem => elem.id !== identificator);
    setConfirmedVideos(result);
  }, [confirmedVideos, setConfirmedVideos]);

  const handleDiscard = useCallback(() => {
    setConfirmedVideos([]);
    setProjectName("");
    setVideos({name: "", url: ""});
    setOpenModal(false);
  }, [setConfirmedVideos, setProjectName, setVideos, setOpenModal]);

  const handleComplete = useCallback(() => {
    setLoading(true);
    const finalData = {projectName, videos: confirmedVideos};
    axios.post(`${baseUrl}/${ADD_YOUTUBE_VIDEOS}`, { finalData })
    .then(response => {
      const { data } = response?.data;
      if (data) { handleDiscard(); setLoading(false); }
      else alert("Ha ocurrido un error!")
    }).catch(err => console.error(err));
  }, [
    ADD_YOUTUBE_VIDEOS, 
    setLoading, 
    confirmedVideos, 
    projectName, 
    baseUrl, 
    handleDiscard
  ]);

  const handleSelection = useCallback((name) => {
    setOpenModal(true); setProjectName(name);
  }, [setOpenModal, setProjectName]);

  const displayRows = useCallback(() => {
    return confirmedVideos.map((elem, index) => (
      <div key={elem.id} className="flex items-center justify-between px-5 mb-3">
        <div className="py-2 px-4 flex items-center border border-gray-400 rounded mr-2">{index + 1}</div>
        <div className="py-2 overflow-x-scroll px-4 flex items-center border border-gray-400 rounded w-[40%]">{elem.name}</div>
        <div className="py-2 overflow-x-scroll px-4 flex items-center border ml-2 border-gray-400 rounded w-[40%]">{elem.url}</div>
        <div className="py-2 overflow-x-scroll px-4 flex items-center border ml-2 border-gray-400 rounded w-[40%]">{elem.portraitName}</div>
        <Button onClick={() => deleteThisRow(elem.id)} variant="contained" sx={{textTransform: "capitalize", width:'12%', padding:'8px 6px', marginLeft:1}}>rem</Button>
      </div>
    ))
  }, [confirmedVideos, deleteThisRow]);

  const mappingNames = useCallback(() => {
    return projects.map((name, index) => (
      <div key={index} className="flex justify-between items-center my-1 hover:bg-slate-100">
        <p className="font-bold">{ name }</p>
        <Button onClick={() => handleSelection(name)} variant="contained" size="small" sx={{textTransform: "initial"}}>Select</Button>
      </div>
    ));
  }, [projects, handleSelection]);

  return (
    <div className="App">
      <div className="w-1/4 h-full flex justify-center my-10 items-center mx-auto">  
        <section className="w-[1000px] h-auto flex-col justify-start overflow-y-scroll">
          {mappingNames()}
        </section>
      </div>

      <Dialog onClose={() => setOpenModal(false)} open={openModal} PaperProps={{style: {width: 1500}}}>
        <DialogContent>
          <DialogTitle id="alert-dialog-title">
            <p className="font-semibold text-gray-700" onClick={() => console.log(confirmedVideos)}>Ingresa los links de videos para este proyecto!</p>
            <Button startIcon={<AddIcon/>}variant="text" sx={{textTransform: "initial", padding:"6px 5px", fontSize:13}}>Agregar otro video</Button>
          </DialogTitle>
          <div>{displayRows()}</div>
          <div className="flex items-center justify-between px-5 mb-3 border-t border-t-gray-200 pt-4">
            <TextField sx={{marginRight:1}} name="name" onChange={handleTexts} autoFocus size="small" id="outlined-basic_1" label="Nombre del video" variant="outlined" />
            <TextField sx={{marginRight:1}} name="url" onChange={handleTexts} autoFocus size="small" id="outlined-basic_2" label="Video URL" variant="outlined" />
            <TextField sx={{marginRight:0}} name="portraitName" onChange={handleTexts} autoFocus size="small" id="outlined-basic_3" label="Portada" variant="outlined" />
            <Button disabled={videos.name !== "" && videos.url !== "" ? false : true}  onClick={handleAdd} variant="contained" sx={{textTransform: "capitalize", padding:"7px 2px", marginLeft:2}}>Add</Button>
          </div>
          <div className="mt-4 px-5 mb-2">
            <LoadingButton
              loading={loading}
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
