import PacienteController from '../controllers/PacienteController.js';
import ConsultaController from '../controllers/ConsultaController.js';
import { View } from './View.js';

import promptSync from 'prompt-sync';
const prompt = promptSync({ sigint: true });

/**
 * Classe `CadastroPacientes` representa a interface para gerenciar as operações relacionadas ao cadastro de pacientes.
 * Essa classe estende a classe `View` e interage com os controladores `PacienteController` e `ConsultaController`.
 */
export class CadastroPacientes extends View {

    /**
     * Construtor da classe CadastroPacientes.
     * @throws {Error} Se `pacientes_controller` não for uma instância de `PacienteController`.
     * @throws {Error} Se `consultas_controller` não for uma instância de `ConsultaController`.
     */
    constructor() {
        super();
    }

    /**
     * Exibe o menu do módulo de cadastro de pacientes.
     */
    show() {
        console.log(
            "\nMenu do Cadastro de Pacientes \n1 - Cadastrar novo paciente \n2 - Excluir paciente " +
            "\n3 - Listar pacientes (ordenado por CPF) \n4 - Listar pacientes (ordenado por nome) \n5 - Voltar p/ menu principal"
        );
    }

    /**
     * Realiza o cadastro de um novo paciente.
     * Utiliza o controlador de pacientes para gerenciar os dados e validar as entradas.
     * @async
     */
    async cadastrarNovoPaciente() {
        console.log("Cadastro de novo paciente:");
        PacienteController.iniciarNovoPaciente();

        // Esse wrapper serve para conseguir passar o contexto da instância para o método
        const resultado_cpf = await super.validarEntrada("CPF: ", async (entrada) => (PacienteController.setCpf(entrada)));
        if(!resultado_cpf.success) 
            return;
            
        await super.validarEntradaLoop("Nome: ", (entrada) => PacienteController.setNome(entrada));
        await super.validarEntradaLoop("Data de nascimento: ", (entrada) => PacienteController.setData_nasc(entrada));

        const resultado = await PacienteController.addPaciente();
        if (resultado.success) {
            console.log("\nPaciente cadastrado com sucesso!");
        } else {
            this.processarErros(resultado.error);
        }
    }

    /**
     * Exclui um paciente com base no CPF fornecido.
     * @async
     * @throws {Error} Caso o CPF seja inválido ou o paciente não seja encontrado.
     */
    async excluirPaciente() {
        const cpf = prompt("CPF: ");
        const resultado = await PacienteController.removePaciente(cpf);

        if (resultado.success) {
            console.log("\nPaciente excluído com sucesso.");
        } else {
            this.processarErros(resultado.error);
        }
    }

    /**
     * Lista os pacientes cadastrados, ordenados por CPF.
     */
    async listarPacientesOrdenadoPorCpf() {
        const lista_pacientes = await PacienteController.getPacientesOrdenadosPorCpf();
        console.log(lista_pacientes)
    }

    /**
     * Lista os pacientes cadastrados, ordenados por nome.
     */
    async listarPacientesOrdenadoPorNome() {
        const lista_pacientes = await PacienteController.getPacientesOrdenadosPorNome();
        console.log(lista_pacientes)
    }

    /**
     * Processa a opção selecionada no menu.
     * @param {number} opcao - Opção selecionada pelo usuário.
     * @returns { {tela: string, sair: boolean} }; Objeto contendo o nome da tela e o estado de continuidade.
     */
    async processarOpcao(opcao) {
        switch (opcao) {
            case 1:
                await this.cadastrarNovoPaciente();
                return { tela: "CadastroPacientes", sair: true};

            case 2:
                await this.excluirPaciente();
                return { tela: "CadastroPacientes", sair: true};

            case 3:
                await this.listarPacientesOrdenadoPorCpf();
                return { tela: "CadastroPacientes", sair: true};

            case 4:
                await this.listarPacientesOrdenadoPorNome();
                return { tela: "CadastroPacientes", sair: true};

            case 5:
                return { tela: "Menu", sair: true};

            default:
                console.log("Opção inválida! Por favor, escolha uma opção de 1 a 5.");
                return { tela: "CadastroPacientes", sair: false};
        }
    }
}
