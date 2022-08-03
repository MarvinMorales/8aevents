import eel, os, gc, pathlib, shutil, json, random
import mysql.connector
from datetime import datetime, timedelta
import ffmpeg_streaming, requests
from ffmpeg_streaming import Representation, Size, Bitrate, Formats

serverURL = 'https://server.8aevents.com/api'

eel.init('web')
__NICK_NAME__ = "__FINAL_PROJ__"

def get_project_size(path):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for i in filenames:
            f = os.path.join(dirpath, i)
            total_size += os.path.getsize(f)
    return total_size

def convertProject(_video: str, route: str, proj: str) -> bool:
    try:
        _1080p  = Representation(Size(1920, 1080), Bitrate(2048 * 1024, 320 * 1024))
        print(os.path.join(route, 'videos', _video, f'{_video}.mp4'))
        video = ffmpeg_streaming.input(os.path.join(route, 'videos', _video, f'{_video}.mp4'))
        hls = video.hls(Formats.h264())
        hls.encryption(os.path.join(route, 'videos', _video, 'key'), f'{serverURL}/hls/key/{proj}/{_video}/key', 5)
        hls.representations(_1080p)
        hls.output(os.path.join(route, 'videos', _video, 'index.m3u8'))
        os.remove(os.path.join(route, 'videos', _video, f'{_video}.mp4'))
        del hls, video, _1080p
        gc.collect()
        return True
    except OSError as error: return error

def getAuthorization() -> tuple:
    try:
        _params = {"email":"marvmustaf@gmail.com", "password":"Hassi2016!"}
        _headers = {"Content-Type":"application/json"}
        _endPoint = f'{serverURL}/auth'
        response = requests.post(url=_endPoint, json=_params, headers=_headers)
        del _params, _headers, _endPoint
        gc.collect()
        return (response.headers['authorization'], response.json()['user_name'])
    except OSError as error: return error

@eel.expose
def processToUploadFiles(route: str, check: bool) -> str:
    token, userName = getAuthorization()
    folderName = os.path.basename(route)
    parentPath = pathlib.Path(os.path.join(route)).parent.resolve()
    try:
        os.mkdir(os.path.join(parentPath, __NICK_NAME__))
        shutil.copytree(route, os.path.join(parentPath, __NICK_NAME__, f'{folderName}-unzip'))
        shutil.copytree(route, os.path.join(parentPath, __NICK_NAME__, folderName))
        for videoFolder in os.listdir(os.path.join(parentPath, __NICK_NAME__, folderName, 'videos')):
            convertProject(videoFolder, os.path.join(parentPath, __NICK_NAME__, f'{folderName}-unzip'), folderName)
        try:
            os.chdir(os.path.join(parentPath, __NICK_NAME__))
            new_file_name = folderName
            _photos = os.listdir(os.path.join(new_file_name, 'fotos'))
            _videos = os.listdir(os.path.join(new_file_name, 'videos'))
            _portraits = os.listdir(os.path.join(new_file_name, 'portadas'))
            finalObj, videos, fotos = dict(), dict(), dict()
            finalObj["project_rating"] = [0,0,0,0,0]
            finalObj["project_creation_date"] = str(datetime.now()).split(".")[0]
            finalObj["project_creator"] = "__EDITOR__"
            if check: 
                randomlist = []
                for i in range(0,6):
                    n = random.randint(1,50)
                    randomlist.append(n)
                finalObj["project_secured"] = "".join([str(x) for x in randomlist])
            for _photo in _photos: fotos[_photo] = [0,0,0,0,0]
            for _video in _videos: 
                listedVideo = os.listdir(os.path.join(new_file_name, 'videos', _video))
                videos[_video] = dict()
                videos[_video]["rating"] = [0,0,0,0,0]
                videos[_video]["portrait"] = str()
                if 'back' in _video.lower(): finalObj["project_background_video"] = listedVideo[0].split(".")[0]
            for _portrait in _portraits:
                for i, value in videos.items():
                    if i.split(".")[0].lower() == _portrait.split(".")[0].lower():
                        videos[i]['portrait'] = _portrait
            finalObj['fotos'], finalObj['videos'] = fotos, videos
            sz = get_project_size(new_file_name)
            finalObj["project_size"] = round(sz * 9.537 * pow(10, -7), 2)
            conn = mysql.connector.connect(
                host="www.8aevents.com",
                database="aeventsc_gabrielevents",
                user="aeventsc_7aamin",
                passwd="Hassi2016!")
            cursor = conn.cursor(dictionary=True)
            cursor.execute(f"""Insert into `projects` (`project_name`, `project_info`) 
                values ('{new_file_name}', '{json.dumps(finalObj)}');""")
            conn.commit()
            cursor.close()
            conn.close()
            shutil.make_archive(folderName, 'zip', os.path.join(parentPath, __NICK_NAME__, folderName))
            shutil.make_archive(f'{folderName}-unzip', 'zip', os.path.join(parentPath, __NICK_NAME__, f'{folderName}-unzip'))
            os.remove(os.path.join(parentPath, __NICK_NAME__, folderName))
            os.remove(os.path.join(parentPath, __NICK_NAME__, f"{folderName}-unzip"))
        except FileNotFoundError as err_1: return err_1
        except ValueError as err_2: return err_2
    except OSError as error: return error
    del folderName, parentPath, token, userName
    gc.collect()
    #finalRes = {"finished":True}
    #if "project_secured" in finalObj: finalRes['code'] = finalObj['project_secured']
    return True#json.dumps(finalRes)
    
eel.start('index.html', port=32001, geometry={'size': (200, 100), 'position': (300, 50)})