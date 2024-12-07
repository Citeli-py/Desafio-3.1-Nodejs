import { View } from './View.js';

import Database from '../db/Database.js';


export class Menu extends View{

    show() {
        console.log("\nMenu Principal\n1 - Cadastro de pacientes\n2 - Agenda\n3 - Fim\n");
    }

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

    async autenticar(){
        const isAutenticado = await Database.autenticacao();
        if(!isAutenticado.sucess){
            this.processarErros(isAutenticado.error);
            return false;
        }

        return true;
    }
}
