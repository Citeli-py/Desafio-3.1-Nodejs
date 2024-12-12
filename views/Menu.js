import { View } from './View.js';
import Database from '../db/Database.js';


export class Menu extends View{

    /**
     * Mostras as opções dessa tela
     */
    show() {
        console.log("\nMenu Principal\n1 - Cadastro de pacientes\n2 - Agenda\n3 - Fim\n");
    }

    /**
     * Esse metódo é responsavel por trocar as telas baseado na entrada do usuário
     * 
     * @param {number} opcao - número escolhido pelo usuário para trocar as telas
     * @returns {{tela?: string, sair: boolean}} - retorna a tela que deve ser tocada e se deve trocar
     */
    processarOpcao(opcao){
        switch (opcao) {
            case 1:
                return { tela: "CadastroPacientes", sair: true};

            case 2:
                return { tela: "Agendamento", sair: true };
            case 3:
                return { tela: "Fim", sair: true };
            default:
                // Chama novamente se a opção for inválida
                console.log("Opção inválida! Por favor, escolha uma opção de 1 a 3.\n");
                return { sair: false };
        }
    }

    /**
     * Verifica se foi possivel se autenticar com o banco de dados
     * @returns {boolean} - retorna verdadeiro se foi possivel autenticar a conexão
     */
    async autenticar(){
        const isAutenticado = await Database.autenticacao();
        if(!isAutenticado.sucess){
            this.processarErros(isAutenticado.error);
            return false;
        }

        return true;
    }
}
