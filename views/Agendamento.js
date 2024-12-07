import { View } from "./View.js";
import PacienteController from "../controllers/PacienteController.js";
import ConsultaController from "../controllers/ConsultaController.js";

import { ErrorCodes } from "../utils/Error.js";

/**
 * Classe `Agendamento` representa a interface para gerenciar as operações relacionadas ao agendamento de consultas.
 * Essa classe estende a classe `View` e interage com os controladores `PacienteController` e `ConsultaController`.
 */
export class Agendamento extends View{

    /**
     * Construtor da classe Agendamento.
     */
    constructor() {
        super();
    }

    /**
     * Exibe o menu do módulo de agendamento de consultas.
     */
    show(){
        console.log("\nAgenda \n1-Agendar consulta \n2-Cancelar agendamento \n3-Listar agenda \n4-Voltar p/ menu principal\n");
    }

    /**
     * Realiza o agendamento de uma nova consulta.
     * Solicita as informações necessárias do usuário e utiliza o controlador de consultas para validar e salvar os dados.
     * @async
     */
    async agendarConsulta(){
        ConsultaController.iniciarNovaConsulta();

        // Esse wrapper serve para conseguir passar o contexto da instância para o método
        const cpf_valido = await super.validarEntrada("CPF: ", async (entrada) => ConsultaController.setCpf(entrada));

        // Se errar no cpf desistir da operação
        if(!cpf_valido.success)
            return;

        await super.validarEntradaLoop("Data da consulta: ", (entrada) => ConsultaController.setDataConsulta(entrada));
        await super.validarEntradaLoop("Hora inicial: ", (entrada) => ConsultaController.setHoraInicial(entrada));
        await super.validarEntradaLoop("Hora final: ", (entrada) => ConsultaController.setHoraFinal(entrada));

        const resultado = await ConsultaController.addConsulta();
        if (resultado.success) {
            console.log("\nAgendamento realizado com sucesso!");
        } else {
            this.processarErros(resultado.error);
        }
    }

    /**
     * Cancela um agendamento existente.
     * Solicita o CPF, data e hora da consulta, validando as informações antes de cancelar.
     * @async
     */
    async cancelarAgendamento(){

        // Esse wrapper serve para conseguir passar o contexto da instância para o método
        const cpf_valido = await super.validarEntrada("CPF: ", async (entrada) => PacienteController.validaCpf(entrada));

        // Se errar no cpf desistir da operação
        if(!cpf_valido.success)
            return;

        // COrrigir mensagem de erro. não se pode desmarcar consultas passadas
        const data_consulta = await super.validarEntradaLoop("Data da consulta: ", (entrada) => ConsultaController.validaData(entrada));
        const hora_inicial = await super.validarEntradaLoop("Hora inicial: ", (entrada) => ConsultaController.validaHoraInicial(entrada));

        const resultado = await ConsultaController.removeConsulta(cpf_valido.entrada, data_consulta, hora_inicial);

        if (resultado.success) {
            console.log("\nAgendamento cancelado com sucesso!");
        } else {
            this.processarErros(resultado.error);
        }
    }

    /**
     * Lista as consultas agendadas.
     * Permite listar todas as consultas ou filtrar por um período específico.
     * 
     * @async
     */
    async listarAgenda(){
        const opcao = await super.validarEntradaLoop("Apresentar a agenda T-Toda ou P-Periodo: ", (entrada) => {
                if((entrada === 'T') || (entrada === 'P'))
                    return {success: true}

                return {success: false, error: ErrorCodes.ERR_ENTRADA_INVALIDA_AGENDA};
        })
        
        if(opcao === 'T') {
            console.log(await ConsultaController.listarConsultas());
            return;
        }

        // Preciso de um jeito melhor de validar entradas
        const data_inicial = await super.validarEntradaLoop("Data inicial: ", (entrada) => ConsultaController.validaData(entrada));
        const data_final = await super.validarEntradaLoop("Data final: ", (entrada) => ConsultaController.validaData(entrada, data_inicial));

        console.log(await ConsultaController.listarConsultas(true, data_inicial, data_final));
    }

    /**
     * Processa a opção selecionada no menu.
     * @param {number} opcao - Opção selecionada pelo usuário.
     * @returns {{tela: string, sair: boolean}} Objeto contendo o nome da tela e o estado de continuidade.
     */
    async processarOpcao(opcao){
        switch (opcao) {
            case 1:
                await this.agendarConsulta();
                return { tela: "Agendamento", sair: true};

            case 2:
                await this.cancelarAgendamento();
                return { tela: "Agendamento", sair: true };

            case 3:
                await this.listarAgenda()
                return { tela: "Agendamento", sair: true };
            
            case 4:
                return { tela: "Menu", sair: true };

            default:
                // Chama novamente se a opção for inválida
                console.log("Opção inválida! Por favor, escolha uma opção de 1 a 4.");
                return { sair: false };
        }
    }


};