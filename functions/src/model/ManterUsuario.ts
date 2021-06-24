export class ManterUsuario{
    nome?: string;
    email?: string;
    senha?: string;
    id?: string;
    constructor(nome?: string, email?: string, senha?: string, id?: string){
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.id = id;
    }

    public isUsuarioValido(): boolean{
        return this.email !== undefined && this.email !== "" && this.senha !== undefined && this.senha !== "";
    }
    static toManterUsuario(json: any = {}): ManterUsuario{
        return new ManterUsuario(json.nome, json.email, json.senha, json.id);
    }
    public toJson(): any{
        return JSON.parse(JSON.stringify(this));
    }
}