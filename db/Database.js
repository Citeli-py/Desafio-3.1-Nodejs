import { Sequelize } from "sequelize";
import { Paciente } from "../models/Paciente.js";
import { Consulta } from "../models/Consulta.js";

import { ErrorCodes } from "../utils/Error.js";

import dotenv from 'dotenv';
dotenv.config();

/**
 * Classe Singleton para conexão com o banco de dados postgresql e tratamento de erros
 */
class Database {
    /**
     * @property {Sequelize} conexao
     */
    #conexao

    constructor() {
        if (Database.instance) 
            return Database.instance; // Retorna a instância existente
        
        const env = process.env;
        this.#conexao = new Sequelize(env.DATABASE, env.DB_USER, env.DB_PASSWORD, {
            dialect: "postgres",
            host: process.env.DB_HOST,
            logging: false,
        });

        this.init();
        Database.instance = this; // Salva a instância
    }

    init(){
        
        Paciente.init(this.#conexao);
        Consulta.init(this.#conexao);

        Paciente.hasMany(Consulta, {
            foreignKey: "cpf_paciente", // Define que a chave estrangeira é cpf_paciente
            sourceKey: "cpf",           // Indica que o campo no Paciente é cpf
            as: "consultas",            // Alias para a relação
        });
        
        Consulta.belongsTo(Paciente, {
            foreignKey: "cpf_paciente", // Define a chave estrangeira
            targetKey: "cpf",           // Indica que a referência no Paciente é cpf
            as: "paciente",             // Alias para a relação
        });
    }

    /**
     * Realiza a autenticação com o banco de dados, caso haja um erro retorna o erro apropriado
     * 
     * @returns {{sucess: boolean, error?: number}} - resposta da autenticação
     */
    async autenticacao(){
        // Realizar authenticação
        try {
            // Testando a conexão
            await this.#conexao.authenticate();
            return {sucess: true};
    
        } catch (error) {

            //console.log("Erro ao se conectar ao banco de dados: ");
            
            // Futuramente retornar o tipo de erro em um objeto
            switch (error.original.code) {
                case '28P01': // Login inválido
                    return {sucess: false, error: ErrorCodes.ERR_BD_LOGIN_INVALIDO};
            
                case 'EAI_AGAIN': // Host desconhecido
                    return {sucess: false, error: ErrorCodes.ERR_BD_HOST_INVALIDO};
            
                case '3D000': // Banco de dados não existe
                    return {sucess: false, error: ErrorCodes.ERR_BD_INEXISTENTE};
            
                default: // Outros erros
                    return {sucess: false, error: ErrorCodes.ERR_BD_DESCONHECIDO};
            }
        };
    }

    async close(){
        await this.#conexao.close();
    }

    // Método para acessar o Sequelize
    get conexao() {
        return this.#conexao;
    }

    
}

// Exporta uma única instância do Database
export default new Database();
