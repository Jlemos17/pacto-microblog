import { firestore } from "firebase-admin";
import { Request, Response } from "express";
import { HttpUtil } from "../util/httpUtil";
import { Comentario, Postagem } from "../model/Postagem";
import { ManterUsuario } from "../model/ManterUsuario";

export class PostagemService {
    private db: firestore.Firestore;

    constructor(db:firestore.Firestore){
        this.db = db;
    }

    public manterPostagem (request:Request, response:Response){
        if(request.body=== undefined){
            request.body = {};
        }
       const postagem = Postagem.toPostagem(request.body);
       if (postagem.isValida()) {
           if (postagem.id=== undefined) {
               postagem.id = this.db.collection("x").doc().id;
               postagem.dataDePostagem = new Date();
            } else{
                postagem.dataDePostagem = undefined;
            }
            this.db.doc(`publicacoes/${postagem.id}`).set(postagem.toJson(),{merge:true})
                .then(resultadoSnap => {
                   HttpUtil.sucesso(postagem.toJson(), response);
               }).catch(erro => {
                   HttpUtil.falha("Postagem invalida"+erro, response);
               })
       } else {
            HttpUtil.falha("Postagem invalida", response);
       }
    }
    public comentaPublicacao(request: Request, response: Response){
        const idPostagem = request.query.id;
        const comentario = Comentario.toComentario(request.body);
        let post: Postagem;
        if (idPostagem=== undefined || idPostagem=== "") {
            HttpUtil.falha("o paramentr id não pode ser nullo",response);           
        } else if (!comentario.isValido()){
            HttpUtil.falha("O comentario deve ser preenchido",response);
        } else {
            this.db.doc(`publicacoes/${idPostagem}`).get()
            .then(postSnap => {
                post = Postagem.toPostagem(postSnap.data());
                comentario.dataDocomentario = new Date();
                comentario.id = this.db.collection("x").doc().id;
                if (post.comentarios=== undefined) post.comentarios = [];
                post.comentarios.push(comentario);
                return postSnap.ref.set(post.toJson(), {merge: true});
            }).then(_ =>{
                HttpUtil.sucesso(post.toJson(), response);
            }).catch(erro => {
                HttpUtil.falha("Houve uma falha ao tentar inserir o comentário"+erro,response);
            })
        }
    }
    public excluirPostagem (request: Request, response: Response){
        if (request.query.id=== undefined || request.query.id=== ""){
            HttpUtil.falha("Post invalido",response);
        } else {
            this.db.doc(`publicacoes/${request.query.id}`).delete().then(_ => {
                HttpUtil.sucesso("Post excluido com sucesso", response);
            }).catch(erro => {
                HttpUtil.falha("Ops! Tive uma falha"+erro, response);
            })
        }
    }
    public excluirComentario (request: Request, response: Response){
        const idPostagem = request.query.id;
        const idComentario = request.query.idComentario;
        let postagem: Postagem;
        if (idPostagem=== undefined || idPostagem=== "" || idComentario=== undefined || idComentario=== "") {
            HttpUtil.falha("Erro, Post ou comentario invalido", response);
        } else {
            this.db.doc(`publicacoes/${idPostagem}`).get().then(postSnap =>{
                postagem = Postagem.toPostagem(postSnap.data());
                postagem.comentarios = postagem.comentarios?.filter(c => c.id !== idComentario);
                return postSnap.ref.set(postagem.toJson());
            }).then(_ => {
                HttpUtil.sucesso(postagem.toJson(), response);
            }).catch(erro => {
                HttpUtil.falha("Ops! houve um erro inseperado"+erro,response);
            })
        }
    }

    public darLikeNoPost (request: Request, response: Response) {
        const idPostagem = request.query.id;
        const like = ManterUsuario.toManterUsuario(request.body);
        let postagem: Postagem;
        if (idPostagem=== undefined || idPostagem=== "" || like=== undefined){
            HttpUtil.falha("O like não pode ser dado, pois o paramentro id está vazio", response);
        } else {
            this.db.doc(`publicacoes/${idPostagem}`).get().then(postSnap => {
                postagem = Postagem.toPostagem(postSnap.data());
                if (postagem.likes=== undefined) postagem.likes =[];
                postagem.likes.push(like);
                return postSnap.ref.set(postagem.toJson());
            }).then(_ => {
                HttpUtil.sucesso(postagem.toJson(), response);
            }).catch(erro => {
                HttpUtil.falha("Ops! houve um erro inesperado"+erro, response);
            })

        }
    }

    public removerLikeDoPost (request: Request, response: Response){
        const idPostagem = request.query.id;
        const idUsuario = request.query.idUsuario;
        let postagem: Postagem;
        if (idPostagem=== undefined || idPostagem=== "" || idUsuario=== undefined || idUsuario=== "") {
            HttpUtil.falha("Não foi possivel remover like, falta id da publicação ou id do usuário", response);
        } else {
            this.db.doc(`publicacoes/${idPostagem}`).get().then(postSnap => {
                postagem = Postagem.toPostagem(postSnap.data());
                postagem.likes = postagem.likes?.filter(l => l.id !== idUsuario);
                return postSnap.ref.set(postagem.toJson());
            }).then(_ => {
                HttpUtil.sucesso(postagem.toJson(), response);
            }).catch(erro => {
                HttpUtil.falha("Ops! houve um erro inseperado"+erro,response);
            })
        }
    }

    public listaPublicacoes (request: Request, response: Response) {
        this.db.collection("publicacoes").orderBy("dataDePostagem","desc").get().then(postagemSnap => {
            const listaPublicacoes: Postagem[] = [];
            postagemSnap.docs.forEach(postSnap => {
                listaPublicacoes.push(Postagem.toPostagem(postSnap.data()));
            });
            HttpUtil.sucesso (listaPublicacoes, response);
        }).catch(erro => {
            HttpUtil.falha("Ops! houve um erro inesperado"+erro,response);
        })
    }
}