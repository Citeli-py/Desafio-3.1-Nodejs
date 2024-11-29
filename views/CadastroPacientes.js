import { PacienteController } from '../controllers/PacienteController.js';
import { ConsultaController } from '../controllers/ConsultaController.js';
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
     * @param {PacienteController} pacientes_controller - Controlador responsável pelos pacientes.
     * @param {ConsultaController} consultas_controller - Controlador responsável pelas consultas.
     * @throws {Error} Se `pacientes_controller` não for uma instância de `PacienteController`.
     * @throws {Error} Se `consultas_controller` não for uma instância de `ConsultaController`.
     */
    constructor(pacientes_controller, consultas_controller) {
        super();

         // Verificando se pacientes_controller é uma instancia do PacienteController
         if(!(pacientes_controller instanceof PacienteController))
            throw new Error("pacientes_controller não é uma instancia de PacienteController");

        // Verificando se consultas_controller é uma instancia do ConsultaController
        if(!(consultas_controller instanceof ConsultaController))
            throw new Error("consultas_controller não é uma instancia de ConsultaController");
        
        this.pacientes_controller = pacientes_controller;
        this.consultas_controller = consultas_controller;
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
     */
    cadastrarNovoPaciente() {
        console.log("Cadastro de novo paciente:");
        this.pacientes_controller.iniciarNovoPaciente();

        // Esse wrapper serve para conseguir passar o contexto da instância para o método
        super.validarEntradaLoop("CPF: ", (entrada) => this.pacientes_controller.setCpf(entrada));
        super.validarEntradaLoop("Nome: ", (entrada) => this.pacientes_controller.setNome(entrada));
        super.validarEntradaLoop("Data de nascimento: ", (entrada) => this.pacientes_controller.setData_nasc(entrada));

        const resultado = this.pacientes_controller.addPaciente();
        if (resultado.success) {
            console.log("\nPaciente cadastrado com sucesso!");
        } else {
            this.processarErros(resultado.error);
        }
    }

    /**
     * Exclui um paciente com base no CPF fornecido.
     * @throws {Error} Caso o CPF seja inválido ou o paciente não seja encontrado.
     */
    excluirPaciente() {
        const cpf = prompt("CPF: ");
        const resultado = this.pacientes_controller.removePaciente(cpf, this.consultas_controller);

        if (resultado.success) {
            console.log("\nPaciente excluído com sucesso.");
        } else {
            this.processarErros(resultado.error);
        }
    }

    /**
     * Lista os pacientes cadastrados, ordenados por CPF.
     */
    listarPacientesOrdenadoPorCpf() {
        const lista_pacientes = this.pacientes_controller.getPacientesOrdenadosPorCpf(this.consultas_controller);
        console.log(lista_pacientes)
    }

    /**
     * Lista os pacientes cadastrados, ordenados por nome.
     */
    listarPacientesOrdenadoPorNome() {
        const lista_pacientes = this.pacientes_controller.getPacientesOrdenadosPorNome(this.consultas_controller);
        console.log(lista_pacientes)
    }

    /**
     * Processa a opção selecionada no menu.
     * @param {number} opcao - Opção selecionada pelo usuário.
     * @returns { {tela: string, sair: boolean} }; Objeto contendo o nome da tela e o estado de continuidade.
     */
    processarOpcao(opcao) {
        switch (opcao) {
            case 1:
                this.cadastrarNovoPaciente();
                return { tela: "CadastroPacientes", sair: true};

            case 2:
                this.excluirPaciente();
                return { tela: "CadastroPacientes", sair: true};

            case 3:
                this.listarPacientesOrdenadoPorCpf();
                return { tela: "CadastroPacientes", sair: true};

            case 4:
                this.listarPacientesOrdenadoPorNome();
                return { tela: "CadastroPacientes", sair: true};

            case 5:
                return { tela: "Menu", sair: true};

            default:
                console.log("Opção inválida! Por favor, escolha uma opção de 1 a 5.");
                return { tela: "CadastroPacientes", sair: false};
        }
    }
}
