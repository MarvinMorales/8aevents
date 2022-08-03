
from flask import Flask, request, Response, send_from_directory, jsonify
from flask_cors import CORS, cross_origin
from ffmpeg_streaming import Representation, Size, Bitrate, Formats
from datetime import datetime, timedelta
import ffmpeg_streaming
from dotenv import load_dotenv
import mysql.connector
import hashlib
import urllib.parse
import jwt
import json
import shutil, zipfile
import os, io, sys

projectsFolder = "proyectos"
photosFolder = "fotos"
videosFolder = "videos"
portraitsFolder = "portadas"
port_server = 12000

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding="utf-8")

app = Flask(__name__)
CORS(app)

def Encode_jwt(__payload:str) -> str:
  token_bytes = jwt.encode(__payload, key=os.getenv('SECRET'), algorithm='HS512')
  return token_bytes

def Validate_token(__token:str) -> str:
  try:
    jwt.decode(__token, key=os.getenv('SECRET'), algorithms=['HS256', 'HS512'])
    return {"response": "Valid"}
  except jwt.exceptions.DecodeError as err:
    return {"response": "__TOKEN NOT VALID__", "err": str(err)}
  except jwt.ExpiredSignatureError as err:
    return {"response": "__TOKEN EXPIRED__", "err": str(err)}
  except jwt.InvalidTokenError as err:
    return {"response": "__TOKEN NOT VALID__", "err": str(err)}

def showExceptions(error:Exception):
    print("Error:", error)

#___ Connection to DataBase ___#
def connectDataBase() -> mysql.connector:
    try:
        conn = mysql.connector.connect(
        host="localhost",
        database="aeventsc_gabrielevents",
        user=os.getenv('dbuser'),
        passwd=os.getenv('dbpassword'))
        return conn
    except (OSError, mysql.connector.Error) as error:
        showExceptions(error)

def get_project_size(path):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        for i in filenames:
            f = os.path.join(dirpath, i)
            total_size += os.path.getsize(f)
    return total_size

"""Middleware declaration to start using environment vars"""
@app.before_first_request
def enable_DotEnv():
    load_dotenv()

def responseCreator(payload:dict, status:int, headers:dict=dict()) -> Response:
    response = Response(json.dumps(payload))
    for key, value in headers.items():
        response.headers[key] = value
    response.status = status
    return response

"""This function is deprecated for now, cuz we are not using ffmpeg to convert video to streaming
    Videos are goin to be played just using mp4 format"""
def create_HLS_video(project, folder, videoFolder, file):
    inOutRoute = os.path.join(os.getcwd(), projectsFolder, project, folder)
    _1080p  = Representation(Size(1920, 1080), Bitrate(2048 * 1024, 320 * 1024))
    video = ffmpeg_streaming.input(os.path.join(inOutRoute, videoFolder, file))
    hls = video.hls(Formats.h264())
    hls.representations(_1080p)
    hls.output(os.path.join(inOutRoute, videoFolder, 'index.m3u8'))
    os.remove(os.path.join(inOutRoute, videoFolder, file))

"""___________________________________ADMINS ENDPOINTS___________________________________"""

@app.route("/", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def test_function1():
    if request.method == "GET":
        return "Working"
    else: return "Not allowed"


"""Test route for make testing after server have been configured"""
@app.route("/test/<string:texto>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def test_function(texto: str):
    if request.method == "GET":
        return f"holaaaa {urllib.parse.unquote(texto)}"
    else: return "Not allowed"


#Be carefull with the expiration days token
#it can be a bug while testing phase
@app.route("/auth", methods=["POST"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def auth_api_route() -> Response:
    if request.method == "POST":
        data = json.loads(request.data)
        if conn := connectDataBase():
            try:
                cursor = conn.cursor()
                hashed_string = hashlib.sha256(data['password'].encode('utf-8')).hexdigest()
                sql_statement = f"""Select * from `admins` where `email` = 
                '{data['email']}' and `password` = '{hashed_string}';"""
                cursor.execute(sql_statement)
                adminFound = cursor.fetchall()
                if len(adminFound) == 1:
                    token = Encode_jwt({"user": f"{datetime.now()}-{adminFound[0][0]}", 
                    'exp': datetime.now() + timedelta(days=10)})
                    payload = {"success": True, "user_name":adminFound[0][4], "user_ID": adminFound[0][0]}
                    headers = {"Authorization": token, "Access-Control-Expose-Headers": "*", "Content-Type": "application/json"}
                    return responseCreator(payload, 200, headers)
                elif len(adminFound) != 1: return responseCreator({"success": True, "reason": "no user found!"}, 401)
            except (OSError, mysql.connector.Error) as error: showExceptions(error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)


@app.route("/<int:admin_ID>/create/project/<string:folder>/<string:back>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def create_project_folder(folder: str, admin_ID: int, back: str) -> Response:
    if request.method == "GET":
        validation = Validate_token(request.headers['Authorization'])
        if validation['response'] == "Valid":
            if conn := connectDataBase():
                try:
                    fold = urllib.parse.unquote(folder)
                    project_info = dict()
                    if not os.path.exists(os.getcwd() + f'/{projectsFolder}/{fold}'): 
                        os.makedirs(os.getcwd() + f'/{projectsFolder}/{fold}')
                    if os.path.exists(os.getcwd() + f'/{projectsFolder}/{fold}'):
                        os.makedirs(os.getcwd() + f'/{projectsFolder}/{fold}/{photosFolder}')
                        os.makedirs(os.getcwd() + f'/{projectsFolder}/{fold}/{videosFolder}')
                        os.makedirs(os.getcwd() + f'/{projectsFolder}/{fold}/{portraitsFolder}')
                        try:
                            cursor = conn.cursor()
                            cursor.execute(f"Select `name` from `admins` where `ID` = {admin_ID}")
                            project_info["project_rating"] = [0,0,0,0,0]
                            project_info["project_creator"] = cursor.fetchall()[0][0]
                            project_info["project_creation_date"] = str(datetime.now()).split(".")[0]
                            project_info["project_background_video"] = urllib.parse.unquote(back)
                            project_info["videos"] = dict()
                            project_info["fotos"] = dict()
                            project_info["project_size"] = ""
                            cursor.execute(f"""Insert into `projects` (`project_name`, `project_info`) 
                            values ('{folder}', '{json.dumps(project_info)}');""")
                            conn.commit()
                            cursor.close()
                            conn.close()
                        except (OSError, mysql.connector.Error) as error: showExceptions(error)
                        headers = {"Access-Control-Expose-Headers": "*", "Content-Type": "application/json"}
                        return responseCreator({"success": True}, 200, headers)
                    else: return responseCreator({"success": False, "reason": "Folder not created"}, 200, headers) 
                except (OSError, mysql.connector.Error) as error: showExceptions(error)
        else: return responseCreator({"success":False, "reason":"no valid token!"}, 401)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)

@app.route("/upload/file/video", methods=["POST"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def uploadFile_api_route_Video() -> Response:
    if request.method == "POST":
        validation = Validate_token(request.headers['Authorization'])
        if validation['response'] == "Valid":
            file = request.files['video']
            projectName = json.loads(request.form.get('projectName'))
            folder = [x for x in file.filename.split(".")][0]
            files_path = os.getcwd() + f"/{projectsFolder}/{projectName['name']}/{videosFolder}"
            if os.path.exists(files_path): os.makedirs(files_path + f"/{folder}")
            file.save(files_path + f"/{folder}/{request.files['video'].filename}")
            #create_HLS_video(file, folder, files_path)
            try:
                if conn := connectDataBase():
                    cursor = conn.cursor(dictionary=True)
                    cursor.execute("""Select `project_info` from `projects` where 
                    `project_name` = '{}';""".format(projectName['name']))
                    result = json.loads(cursor.fetchall()[0]['project_info'])
                    result['videos'][file.filename] = dict()
                    result['videos'][file.filename]['rating'] = [0,0,0,0,0]
                    result['videos'][file.filename]['portrait'] = ""
                    projectSize = get_project_size(os.getcwd() + f"/{projectsFolder}/{projectName['name']}")
                    result['project_size'] = round(projectSize * 9.537 * pow(10, -7), 2)
                    cursor.execute("""Update `projects` set `project_info` = 
                    '{}' where `project_name` = '{}'""".format(json.dumps(result), projectName['name']))
                    conn.commit()
                    cursor.close()
                    conn.close()
            except (OSError, mysql.connector.Error) as error: showExceptions(error)
            headers = {"Content-Type":"application/json"}
            return responseCreator({"success": True, "fileUpload": file.filename}, 200, headers)
        else: return responseCreator({"success":False, "reason":"no valid token!"}, 401)  
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)

@app.route("/upload/file/portraits", methods=["POST"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def upload_portraits() -> Response:
    if request.method == "POST":
        validation = Validate_token(request.headers['Authorization'])
        if validation['response'] == "Valid":
            file = request.files['image']
            if conn := connectDataBase():
                try:
                    cursor = conn.cursor(dictionary=True)
                    projectName = json.loads(request.form.get('projectName'))
                    files_path = os.path.join(os.getcwd(), projectsFolder, projectName['name'], portraitsFolder)
                    #files_path = os.getcwd() + f"/{projectsFolder}/{projectName['name']}/{portraitsFolder}/"
                    file_path = os.path.join(os.getcwd(), projectsFolder, projectName['name'])
                    #file_path = os.getcwd() + f"/{projectsFolder}/{projectName['name']}"
                    file.save(files_path + f"{request.files['image'].filename}")
                    cursor.execute("Select `project_info` from `projects` where `project_name` = '{}';".format(projectName['name']))
                    result = json.loads(cursor.fetchall()[0]['project_info'])
                    projectSize = get_project_size(os.getcwd() + f"/{projectsFolder}/{projectName['name']}")
                    result['videos'][projectName['videoName']]['portrait'] = projectName['portraitName']
                    result['project_size'] = round(projectSize * 9.537 * pow(10, -7), 2)
                    cursor.execute(f"""Update `projects` set `project_info` = '{json.dumps(result)}' 
                    where `project_name` = '{projectName['name']}'""")
                    conn.commit()
                    cursor.close()
                    conn.close()
                    shutil.make_archive(projectName['name'], 'zip', file_path)
                except (OSError, mysql.connector.Error) as error: showExceptions(error)
                headers = {"Content-Type":"application/json"}
                return responseCreator({"success": True, "fileUpload": file.filename}, 200, headers)
        else: return responseCreator({"success":False, "reason":"no valid token!"}, 401)   
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)

@app.route("/upload/file/image", methods=["POST"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def uploadFile_api_route_Image() -> Response:
    if request.method == "POST":
      validation = Validate_token(request.headers['Authorization'])
      if validation['response'] == "Valid":
          file = request.files['image']
          if conn := connectDataBase():
              try:
                cursor = conn.cursor(dictionary=True)
                projectName = json.loads(request.form.get('projectName'))
                files_path = os.path.join(os.getcwd(), projectsFolder, projectName['name'], photosFolder)
                #files_path = os.getcwd() + f"/{projectsFolder}/{projectName['name']}/{photosFolder}/"
                file.save(files_path + f"{request.files['image'].filename}")
                cursor.execute("Select `project_info` from `projects` where `project_name` = '{}';".format(projectName['name']))
                result = json.loads(cursor.fetchall()[0]['project_info'])
                projectSize = get_project_size(os.getcwd() + f"/{projectsFolder}/{projectName['name']}")
                result['project_size'] = round(projectSize * 9.537 * pow(10, -7), 2)
                result['fotos'][file.filename] = dict()['rating'] = [0,0,0,0,0]
                cursor.execute("""Update `projects` set `project_info` = '{}' 
                where `project_name` = '{}'""".format(json.dumps(result), projectName['name']))
                conn.commit()
                cursor.close()
                conn.close()
                return responseCreator({"success":True}, 200, {"Content-Type":"application/json"})
              except (OSError, mysql.connector.Error) as error: showExceptions(error)
      else: return responseCreator({"success":False, "reason":"no valid token!"}, 401)  
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)

@app.route("/<int:admin_id>/retrieve/projects", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Authorization"], max_age=300)
def retrieve_projects(admin_id: int) -> Response:
      if request.method == "GET":
            validation = Validate_token(request.headers['Authorization'])
            if validation['response'] == "Valid":
                  if conn := connectDataBase():
                      try:
                        cursor = conn.cursor()
                        cursor.execute(f"Select `project_name`, `project_info` from `projects`;")
                        projects, result = dict(), cursor.fetchall()
                        for project in result: projects[project[0]] = json.loads(project[1])
                        cursor.close()
                        conn.close()
                        return responseCreator({"success": True, "root_projects": projects}, 200, {"Content-Type":"application/json"})
                      except (OSError, mysql.connector.Error) as error: showExceptions(error)
            else: return responseCreator({"success":False, "reason":"no valid token!"}, 401)
      else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)

@app.route("/<int:admin_id>/delete/projects", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def delete_projects(admin_id: int) -> Response:
      if request.method == "GET":
          validation = Validate_token(request.headers['Authorization'])
          if validation['response'] == "Valid":
              if conn := connectDataBase():
                  try:
                    cursor = conn.cursor()
                    projects = request.args.get('projectList')
                    for project in json.loads(projects):
                        shutil.rmtree(os.getcwd() + f'/{projectsFolder}/{project}')
                        shutil.rmtree(os.getcwd() + f'/{projectsFolder}/{project}')
                        cursor.execute(f"Delete from `projects` where `project_name` = '{project}';")
                        conn.commit()
                    cursor.execute(f"Select `project_name`, `project_info` from `projects`;")
                    projects, result = dict(), cursor.fetchall()
                    cursor.close()
                    conn.close()
                    for project in result: projects[project[0]] = json.loads(project[1])
                    return responseCreator({"success": True, "root_projects": projects}, 200, {"Content-Type":"application/json"})
                  except (OSError, mysql.connector.Error) as error: showExceptions(error)
          else: return responseCreator({"success":False, "reason":"no valid token!"}, 401)
      else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)



@app.route("/upload/file/zip", methods=["POST"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization", "Transfer-Encoding"], max_age=300)
def upload_zip_file() -> Response:
    if request.method == "POST":
        validation = Validate_token(request.headers['Authorization'])
        if validation['response'] == "Valid":
            zipFile = request.files['zipFile']
            file_name = zipFile.filename.split(".")[0]
            if "-copy" in file_name:
                zipFile.save(os.path.join(os.getcwd(), projectsFolder, zipFile.filename))
                finalObj, videos, fotos = dict(), dict(), dict()
                finalObj["project_rating"] = [0,0,0,0,0]
                finalObj["project_creation_date"] = str(datetime.now()).split(".")[0]
                finalObj["project_creator"] = "__EDITOR__"
                zipRoute = os.path.join(os.getcwd(), projectsFolder, zipFile.filename)
                shutil.unpack_archive(zipRoute, os.path.join(os.getcwd(), projectsFolder, file_name), "zip")
                os.remove(os.path.join(os.getcwd(), projectsFolder, zipFile.filename))
                os.rename(os.path.join(os.getcwd(), projectsFolder, file_name), 
                    os.path.join(os.getcwd(), projectsFolder, f'{file_name.split("-copy")[0]}'))
                new_file_name = f'{file_name.split("-copy")[0]}'
                _photos = os.listdir(os.path.join(os.getcwd(), projectsFolder, new_file_name, photosFolder))
                _videos = os.listdir(os.path.join(os.getcwd(), projectsFolder, new_file_name, videosFolder))
                _portraits = os.listdir(os.path.join(os.getcwd(), projectsFolder, new_file_name, portraitsFolder))
                for _photo in _photos: fotos[_photo] = [0,0,0,0,0]
                for _video in _videos: 
                    listedVideo = os.listdir(os.path.join(os.getcwd(), projectsFolder, new_file_name, videosFolder, _video))
                    videos[_video] = dict()
                    videos[_video]["rating"] = [0,0,0,0,0]
                    videos[_video]["portrait"] = str()
                    if 'back' in _video.lower(): finalObj["project_background_video"] = listedVideo[0].split(".")[0]
                for _portrait in _portraits:
                    for i, value in videos.items():
                        if i.split(".")[0].lower() == _portrait.split(".")[0].lower():
                            videos[i]['portrait'] = _portrait
                finalObj['fotos'], finalObj['videos'] = fotos, videos
                sz = get_project_size(os.path.join(os.getcwd(), projectsFolder, new_file_name))
                finalObj["project_size"] = round(sz * 9.537 * pow(10, -7), 2)
                try:
                    if conn := connectDataBase():
                        cursor = conn.cursor(dictionary=True)
                        cursor.execute(f"""Insert into `projects` (`project_name`, `project_info`) 
                            values ('{new_file_name}', '{json.dumps(finalObj)}');""")
                        conn.commit()
                        cursor.close()
                        conn.close()
                except (OSError, mysql.connector.Error) as error: showExceptions(error)
                return responseCreator({"success": True, "status":"project created!"}, 200, {"Content-Type":"application/json"})
            elif "-copy" not in file_name:
                zipFile.save(os.path.join(os.getcwd(), projectsFolder, zipFile.filename))
                return responseCreator({"success": True, "status":"project created!"}, 200, {"Content-Type":"application/json"})
        else: return responseCreator({"success":False, "reason":"no valid token!"}, 401)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)
                


"""__________________________________CLIENTS ENDPOINTS___________________________________"""

@app.route("/retrieve/projects", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def request_for_projects() -> Response:
    if request.method == "GET":
        if conn := connectDataBase():
            try:
                cursor = conn.cursor(dictionary=True)
                cursor.execute(f"Select `project_name` from `projects`")
                selectedProject = list(cursor.fetchall())
                cursor.close()
                conn.close()
                return responseCreator({"success": True, "data": selectedProject}, 200, {"Content-Type":"application/json"})
            except (OSError, mysql.connector.Error) as error: 
                showExceptions(error)
                return error
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)


@app.route("/retrieve/project/<string:project>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def request_for_project(project: str) -> Response:
    if request.method == "GET":
        if conn := connectDataBase():
            try:
                cursor = conn.cursor(dictionary=True)
                param = urllib.parse.unquote(project)
                cursor.execute(f"Select `project_name`, `project_info` from `projects` where `project_name` = '{param}'")
                selectedProject = cursor.fetchall()[0]
                info = json.loads(selectedProject["project_info"])
                project_data = {
                    "title": selectedProject["project_name"],
                    "videoBack": info["project_background_video"],
                    "photos": info["fotos"],
                    "videos": info["videos"],
                }
                if "project_secured" in info: 
                    project_data['secured'] = info['project_secured']
                cursor.close()
                conn.close()
                return responseCreator({"success": True, "data": project_data}, 200, {"Content-Type":"application/json"})
            except (OSError, mysql.connector.Error) as error: showExceptions(error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)


@app.route("/project/auth", methods=["POST"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def auth_project_code() -> Response:
    if request.method == "POST":
        projectName = request.json['projectName']
        try:
            if conn := connectDataBase():
                cursor = conn.cursor()
                cursor.execute(f"select `project_info` from `projects` where `project_name` = '{projectName}';")
                dataRetrieved = json.loads(cursor.fetchall()[0][0])
                print(f"{dataRetrieved['project_secured']} ====== {request.headers['Authorization']}")
                cursor.close()
                conn.close()
                if dataRetrieved['project_secured'] == request.headers['Authorization']:
                    return responseCreator({"success": True, "auth": True}, 200, {"Content-Type":"application/json"})
                else: return responseCreator({"success": False, "auth": False}, 200, {"Content-Type":"application/json"})
        except OSError as error: print("There was an error:", error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)


@app.route("/load/poster/<string:project>/<string:portada>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type", "Authorization"], max_age=300)
def request_for_portrait(portada: str, project: str) -> send_from_directory:
    if request.method == 'GET':
        try:
            file_path = os.path.join(os.getcwd(), projectsFolder, urllib.parse.unquote(project), portraitsFolder)
            if file_path:
                return send_from_directory(file_path, path=urllib.parse.unquote(portada), as_attachment=False)
            else: return responseCreator({"success": False, "reason":"portrait: '{portada}' not found!"}, 404)
        except OSError as error: print("There was an error:", error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)


@app.route("/load/gallery/<string:project>/<string:foto>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def request_for_gallery(project: str, foto: str) -> send_from_directory:
    if request.method == 'GET':
        try:
            file_path = os.path.join(os.getcwd(), projectsFolder, urllib.parse.unquote(project), photosFolder)
            if file_path: return send_from_directory(file_path, path=foto, as_attachment=False)
            else: return responseCreator({"success": False, "reason":"portrait: '{foto}' not found!"}, 404)
        except OSError as error: print("There was an error:", error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)


@app.route("/download/<string:project>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def download_project(project: str) -> send_from_directory:
    if request.method == "GET":
        try:
            file_path = os.path.join(os.getcwd(), projectsFolder)
            if file_path: return send_from_directory(file_path, path=f"{urllib.parse.unquote(project)}.zip", as_attachment=True)
            else: return responseCreator({"success": False, "reason":"Project: '{project}' not found!"}, 404)
        except OSError as error: print("There was an error:", error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)
    
    
@app.route("/hls/key/<string:project_folder>/<string:v_folder>/<string:key>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def request_HLS_key(project_folder: str, v_folder: str, key: str) -> send_from_directory:
    if request.method == "GET":
      try:
          _v_folder = urllib.parse.unquote(v_folder)
          file_path = os.path.join(os.getcwd(), projectsFolder, urllib.parse.unquote(project_folder), videosFolder, _v_folder)
          if file_path: return send_from_directory(file_path, path=key, as_attachment=False)
          else: return responseCreator({"success": False, "reason":"video: '{ v_folder }' not found!"}, 404)
      except OSError as error: print("There was an error:", error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)
            

@app.route("/load/video/streaming/hls/<string:project_folder>/<string:v_folder>/<string:fileRequested>", methods=["GET"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def request_for_video_streaming(project_folder: str, v_folder: str, fileRequested: str) -> send_from_directory:
    if request.method == "GET":
      try:
          f_req = urllib.parse.unquote(fileRequested)
          _v_folder = urllib.parse.unquote(v_folder)
          file_path = os.path.join(os.getcwd(), projectsFolder, urllib.parse.unquote(project_folder), videosFolder, _v_folder)
          if file_path: return send_from_directory(file_path, path=f_req, as_attachment=False)
          else: return responseCreator({"success": False, "reason":"video: '{ v_folder }' not found!"}, 404)
      except OSError as error: print("There was an error:", error)
    else: return responseCreator({"success":False, "reason":"method not allowed"}, 405)


@app.route("/test/upload", methods=["POST"])
@cross_origin(origins="*", allow_headers=["Content-Type"], max_age=300)
def test_upload():
    if request.method == "POST":
        print(type(request.files['zipFile'].filename))
        return "Hola"

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=port_server)