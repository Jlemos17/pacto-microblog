import { ManterUsuario } from "./ManterUsuario";

export class Postagem {

    id?: String;
    conteudo?: string;
    dataDePostagem?: Date;
    criador?: ManterUsuario;
    likes?: ManterUsuario[];
    comentarios?: Comentario[];
    constructor(conteudo?: string, dataDePostagem?: Date, criador?: ManterUsuario, likes?: ManterUsuario[], comentarios?: Comentario[], id?: String){
        this.conteudo = conteudo;
        this.dataDePostagem = dataDePostagem;
        this.criador = criador;
        this.likes = likes;
        this.comentarios = comentarios;
        this.id = id;
    }
    public isValida(): boolean {
        return this.conteudo !== undefined && this.criador !== undefined;
    }
    static toPostagem(json: any): Postagem{
        return new Postagem(json.conteudo, new Date (json.dataDePostagem), ManterUsuario.toManterUsuario(json.criador),json.likes, json.comentarios, json.id);
    }

    public toJson(): any{
        return JSON.parse(JSON.stringify(this));
    }
}

export class Comentario {
    id?: String;
    dataDocomentario?: Date;
    comentario?: string;
    criador?: ManterUsuario;

    constructor(criador?:ManterUsuario, comentario?:string, dataDoComentario?:Date, id?: string) {
        this.comentario = comentario;
        this.criador = criador;
        this.dataDocomentario = dataDoComentario;
        this.id = id; 
    }

    public isValido(): boolean{
        return this.criador !== undefined && this.comentario !== undefined && this.comentario !== "";
    }
    static toComentario(json: any): Comentario{
        return new Comentario(ManterUsuario.toManterUsuario(json.criador), json.comentario, json.dataDoComentario);
    }
    public toJson(): any{
        return JSON.parse(JSON.stringify(this));
    }
}