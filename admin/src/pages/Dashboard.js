import React from 'react';
import "./css/NewProject.css";
import { CreateProject } from "./CreateProject";
import { configuration } from '../config';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const Dashboard = () => {
    const [projects, setProjects] = React.useState(null);
    const [selectedProjects, setSelectedProjects] = React.useState([]);
    const [createProject, setCreateProject] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [credentials, setCredentials] = React.useState(null);
    const [uploading, setUploading] = React.useState("");
    const navigate = useNavigate();
    
    React.useEffect(() => {
        if (!window.localStorage.getItem('credentials')) navigate("/");
        else {
            const cred = JSON.parse(window.localStorage.getItem('credentials'));
            setCredentials(JSON.parse(window.localStorage.getItem('credentials')));
            axios.get(`${configuration['host']}/${cred['user_ID']}/retrieve/projects`, 
            {headers: { "Authorization": cred['token']} })
            .then(response => {
                if (response.data['success']) setProjects(response.data['root_projects']);
                else if (response.status === 401) navigate("/");
            }).catch(err => console.error(err))
        }
    }, []);

    const FotoOptions = (project) => {
        let arr = [];
        for (let picture in project) {
            if (picture === "fotos")
            for (let item_iter in project[picture])
                arr.push(<option>{ item_iter }</option>)
        } return arr;
    }

    const VideoOptions = (project) => {
        let arr = [];
        for (let video in project) {
            if (video === "videos")
            for (let item_iter in project[video])
                arr.push(<option>{ item_iter }</option>)
        } return arr;
    }

    const addProjectsToDeadList = ev => {
        if (!selectedProjects.includes(ev.target.value)) {
            let a = [...selectedProjects];
            a.push(ev.target.value);
            setSelectedProjects(a);
        } else {
            let index = selectedProjects.indexOf(ev.target.value);
            if (index > -1)
            selectedProjects.splice(index, 1);
        }
    }

    const deleteProjects = () => {
        console.log(credentials['token'])
        let project_array = JSON.stringify(selectedProjects);
        axios.get(`${configuration['host']}/${credentials['user_ID']}/delete/projects`, {
            params: { projectList: project_array },
            headers: { "Content-Type": "application/json", "Authorization": credentials['token'] }
        }).then(response => {
            setProjects(response.data['root_projects']); setSelectedProjects([]);
        }).catch(err => console.error(err))
    }

    const rows = () => {
        let arr = [];
        for (let project in projects) {
            arr.push(
                <div className='rows'>
                    <div className='check-box'><input type="checkbox" 
                    onChange={ ev => addProjectsToDeadList(ev) } value={ project }/></div>
                    <div className='col-1'>{ project }</div>
                    <div className='col-2'>{ projects[project]['project_creation_date'] }</div>
                    <div className='col-3'>
                        <select>{ FotoOptions(projects[project]) }</select>
                    </div>
                    <div className='col-4'>
                        <select>{ VideoOptions(projects[project]) }</select>
                    </div>
                    <div className='col-5'>{ projects[project]['project_creator'] }</div>
                    <div className='col-6'>{ projects[project]['project_size'] } Mb</div>
                </div>
            )
        } return arr;
    }

    return (
        <React.Fragment>
            <section className='body-new-project'>
                <article className='main-box'>
                    <header>
                        <div>
                            <p className='titles'>Dashboard de proyectos</p>
                            <p className='subtitle'>{ (credentials !== null) && credentials['user_name'] } (admin)</p>
                        </div>
                        <div className='container-header'>
                            <button className='add-proj' onClick={ () => deleteProjects() } style={{marginRight:10}}>
                                <i className="fas fa-trash"></i>
                                <p>Eliminar seleccionados</p>
                            </button>
                            <button onClick={ () => navigate('/modal') } className='add-proj'>
                                <i className="fas fa-plus"></i> 
                                <p>Crear Proyecto</p>
                            </button>
                        </div>
                    </header>
                    {
                        (function() {
                            if (!createProject) return (
                                <div className='sub-box'>
                                    <div className='rows'>
                                        <div className='check-box check-box-title'><i className="fas fa-bolt"></i></div>
                                        <div className='col-1 col border-menu b-1'>Nombre de proyecto</div>
                                        <div className='col-2 col border-menu b-2'>Fecha de creación</div>
                                        <div className='col-3 col border-menu b-3'>Images del proyecto</div>
                                        <div className='col-4 col border-menu b-4'>Videos del proyecto</div>
                                        <div className='col-5 col border-menu b-5'>Creador </div>
                                        <div className='col-6 col border-menu b-6'>Peso</div>
                                    </div>
                                    <div className='rows-container'>
                                    { rows() }
                                    </div>
                                </div>
                            ); else return (
                                <CreateProject/>
                            )
                        })()
                    }
                </article>
            </section>
        </React.Fragment>
    );
}