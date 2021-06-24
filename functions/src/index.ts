import * as functions from "firebase-functions";
import * as express from "express";
import * as admin from "firebase-admin";
import {UsuarioService} from "./services/Usuario.service";
import {PostagemService} from "./services/Postagem.service";

// Banco Firestore
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// Relacionada ao usuário
const usuarioExpress = express();
const usuarioService = new UsuarioService(db);

usuarioExpress.get("/cadastrarUsuario", (req, res) => usuarioService.cadastrarUsuario(req, res));

usuarioExpress.get("/logarUsuario", (req, res) => usuarioService.logarUsuario(req, res));

usuarioExpress.get("/editarUsuario", (req, res) => usuarioService.editarUsuario(req, res));

export const usuario = functions.https.onRequest(usuarioExpress);

// Relacionado aos Posts

const postagemExpress = express();

const postagemService = new PostagemService(db);

postagemExpress.get("/manterPublicacao", (req, res) => postagemService.manterPostagem(req, res));

postagemExpress.get("/comentarPost", (req, res) => postagemService.comentaPublicacao(req, res));

postagemExpress.get("/excluirPostagem", (req, res) => postagemService.excluirPostagem(req, res));

postagemExpress.get("/excluirComentario", (req, res) => postagemService.excluirComentario(req, res));

postagemExpress.get("/darLike", (req, res) => postagemService.darLikeNoPost(req, res));

postagemExpress.get("/removerLike", (req, res) => postagemService.removerLikeDoPost(req, res));

postagemExpress.get("/consultarPublicacoes", (req, res) => postagemService.listaPublicacoes(req, res));

export const feed = functions.https.onRequest(postagemExpress);