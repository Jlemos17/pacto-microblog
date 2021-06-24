import { firestore } from "firebase-admin";
import { Request, Response } from 'express';
import { ManterUsuario } from "../model/ManterUsuario";
import { HttpUtil } from "../util/httpUtil";

export class UsuarioService {
    private db: firestore.Firestore;

    constructor(db:firestore.Firestore) {
        this.db = db;
    }

    public cadastrarUsuario(request: Request, response: Response) {
        const usuario: ManterUsuario = ManterUsuario.toManterUsuario(request.body);
        if (usuario.isUsuarioValido()){
            this.db.collection("usuarios").where("email", "==", usuario.email).get()
            .then(usuariosSnaps => {
                if (usuariosSnaps.size=== 0) {
                    const id = this.db.collection("x").doc().id;
                    usuario.id = id;
                    return this.db.doc(`usuarios/${id}`).create(usuario.toJson());
                } else {
                    HttpUtil.falha("O usuário já existe, não e possivel cadastrar", response);
                    return null;
                }
            }).then(responseCriacaoUsuario =>{
                if (responseCriacaoUsuario !== null) {
                    HttpUtil.sucesso(usuario, response);
                }
            }).catch(erro => {
                HttpUtil.falha("Ops! tive uma falha"+erro,response);
            });
        } else {
            HttpUtil.falha("Usuário invalido", response);
        }
    }

    public logarUsuario(request: Request, response: Response) {
        const email = request.query.email;
        const senha = request.query.senha;

        if (email=== null || email=== "" || senha=== null || senha=== "") {
            HttpUtil.falha("Usuário ou senha incorretos", response);
        } else {
            this.db.collection("usuarios").where("email", "==",email).where("senha", "==", senha)
            .get().then(usuarioConsultaSnap => {
                if (usuarioConsultaSnap.empty) {
                    HttpUtil.falha("Usuário e senha incorretos", response);
                } else {
                    const usuario = ManterUsuario.toManterUsuario(usuarioConsultaSnap.docs[0].data());
                    HttpUtil.sucesso(usuario.toJson(), response);
                }
            }).catch(erro => {
                HttpUtil.falha("Ops! tive uma falha"+erro, response);
            })
        }
    }

    public editarUsuario(request: Request, response: Response) {
        const usuarioEditar = ManterUsuario.toManterUsuario(request.body);
        if ( usuarioEditar.isUsuarioValido() && usuarioEditar.id !== undefined && usuarioEditar.id !== ""){
            this.db.doc(`usuarios/${usuarioEditar.id}`).set(usuarioEditar.toJson())
            .then(resultadoSnap => {
                HttpUtil.sucesso(usuarioEditar.toJson(), response);
            }).catch(erro => {
                HttpUtil.falha("Houve u erro ao editar"+erro,response)
            })
        } else {
            HttpUtil.falha("O usuário é invalido",response)
        }
    }
}