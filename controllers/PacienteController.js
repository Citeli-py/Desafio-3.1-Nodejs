import {PacienteBuilder} from "../models/PacienteBuilder.js"
import { DateTime } from "luxon";
import { ErrorCodes } from "../utils/Error.js";
import { ConsultaController } from "./ConsultaController.js";
import { Paciente } from "../models/Paciente.js";

/**
* Controlador responsável por gerenciar as operações relacionadas aos pacientes.
* Inclui funcionalidades para adicionar, remover, validar e listar pacientes,
* bem como verificar agendamentos associados.
*/
export class PacienteController{

    /**
    * Inicializa uma nova instância de PacienteController.
    * 
    * - Armazena pacientes em um `Map` para busca eficiente.
    * - Utiliza um `PacienteBuilder` para gerenciar a construção de pacientes.
    */
    constructor() {
        /** Armazena os pacientes em um hash map para pesquisas rápidas
        * @type {Map<string, Paciente>}
        */
        this.pacientes = new Map();

        /** 
        * @type {PacienteBuilder}
        */
        this.paciente_builder = new PacienteBuilder();
    }

    /**
    * Inicia a construção de um novo paciente, limpando os dados atuais no builder.
    */
    iniciarNovoPaciente(){
        this.paciente_builder.clear();
    }

    /**
    * Valida se o CPF é único e válido.
    * 
    * @param {string} cpf - O CPF do paciente a ser validado.
    * @returns {{success: boolean, error?: number}} - Um objeto contendo `success: true` se válido ou um erro com código correspondente.
    */
    validaCpf(cpf){
        if(!this.paciente_builder.validaCpf(cpf))
            return {success: false, error: ErrorCodes.ERR_CPF_INVALIDO};

        if(!this.pacientes.has(cpf))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        return { success: true }
    }

    /**
    * Define o CPF no builder e verifica se já existe.
    * 
    * @param {string} cpf - O CPF do paciente.
    * @returns {{success: boolean, error?: number}} - Um objeto contendo `success: true` se válido ou um erro com código correspondente.
    */
    setCpf(cpf){
        if(this.pacientes.has(cpf))
            return {success: false, error: ErrorCodes.ERR_CPF_DUPLICADO}

        return this.paciente_builder.setCpf(cpf);
    }

    /**
    * Define o nome no builder.
    * 
    * @param {string} nome - O nome do paciente.
    * @returns {{success: boolean, error?: number}} - Um objeto contendo `success: true` se válido ou um erro com código correspondente.
    */
    setNome(nome){
        return this.paciente_builder.setNome(nome);
    }

    /**
    * Define a data de nascimento no builder.
    * 
    * @param {string} data - O data de nascimento do paciente.
    * @returns {{success: boolean, error?: number}} - Um objeto contendo `success: true` se válido ou um erro com código correspondente.
    */
    setData_nasc(data){
        return this.paciente_builder.setData_nasc(data);
    }

    /**
    * Finaliza e adiciona o paciente ao registro.
    * 
    * @returns {{success: boolean, error?: number}} - Resultado da operação, indicando sucesso ou erro.
    */
    addPaciente(){
        const paciente = this.paciente_builder.build();
        if(!paciente.success)
            return paciente;

        this.pacientes.set(paciente.paciente.cpf, paciente.paciente);
        this.paciente_builder.clear();

        return {success: true};
    }

    /**
    * Remove um paciente do registro, verificando agendamentos futuros antes.
    * 
    * @param {string} cpf - O CPF do paciente a ser removido.
    * @param {ConsultaController} consulta_controller - Controlador de consultas para verificar agendamentos.
    * @returns {{success: boolean, error?: number}} - Resultado da operação, indicando sucesso ou erro.
    */
    removePaciente(cpf, consulta_controller){
        
        // VErifica se o paciente já existe
        if (!this.pacientes.has(cpf)) 
            return { success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO };
        
        // Verifica se o paciente possui agendamentos futuros
        if(consulta_controller.hasAgendamentosFuturos(cpf))
            return { success: false, error: ErrorCodes.ERR_PACIENTE_AGENDADO };
        
        this.pacientes.delete(cpf);
        consulta_controller.removeConsultasPaciente(cpf);

        return { success: true};
    }

    /**
    * Retorna um paciente pelo CPF.
    * 
    * @param {string} cpf - O CPF do paciente.
    * @returns {Paciente|null} - O paciente encontrado ou `null` se não existir.
    */
    getPaciente(cpf){
        if(!this.exists(cpf))
            return null;

        return this.pacientes.get(cpf);
    }

    /**
    * Verifica se um paciente existe no registro.
    * 
    * @param {string} cpf - O CPF do paciente.
    * @returns {boolean} - `true` se o paciente existe, caso contrário `false`.
    */
    exists(cpf) {
        return this.pacientes.has(cpf);
    }


    /**
    * Gera uma lista formatada de pacientes com suas informações e agendamentos futuros.
    * 
    * @param {Array<Paciente>} lista_pacientes - Lista de pacientes a serem formatados.
    * @param {ConsultaController} consulta_controller - Controlador de consultas para verificar agendamentos futuros.
    * @returns {string} - A lista formatada.
    */
    geraListaPacientes(lista_pacientes, consulta_controller){
        // Cabeçalho da tabela
        let resultado = '------------------------------------------------------------\n';
        resultado +=    'CPF         Nome                           Dt.Nasc.    Idade\n';
        resultado +=    '------------------------------------------------------------\n';

        // Iterar sobre os pacientes
        lista_pacientes.forEach((paciente) => {

            // calcular idade do paciente
            const hoje = DateTime.now();
            const idade = Math.floor(hoje.diff(paciente.data_nasc, 'years').years);

            // Adicionar as informações do paciente
            resultado += `${paciente.cpf} ${paciente.nome.padEnd(30, ' ')} ${paciente.data_nasc.toFormat('dd/MM/yyyy')} ${String(idade).padStart(6)}\n`;

            // Verificar se o paciente tem agendamento futuro
            const agendamento = consulta_controller.getAgendamentosFuturos(paciente.cpf);
            if (agendamento.success) {
                // Adicionar informações de agendamento futuro
                agendamento.consultas.forEach((consulta) => {
                    resultado += "".padEnd(12) +`Agendado para: ${consulta.data_consulta.toFormat('dd/MM/yyyy')}\n`
                    resultado += "".padEnd(12)+`${consulta.hora_inicial.toFormat('HH:mm')} às ${consulta.hora_final.toFormat('HH:mm')}\n`;
                });
            }
        });

        resultado +=  '------------------------------------------------------------\n';

        return resultado;
    }

    /**
    * Retorna uma lista formatada de pacientes ordenados por CPF.
    * 
    * @param {ConsultaController} consulta_controller - Controlador de consultas para verificar agendamentos futuros.
    * @returns {string} - A lista formatada.
    */
    getPacientesOrdenadosPorCpf(consulta_controller){
        // Ordenar os pacientes pelo CPF
        const pacientesOrdenados = [...this.pacientes.values()].sort((a, b) => a.cpf - b.cpf);
        return this.geraListaPacientes(pacientesOrdenados, consulta_controller);
    }

    /**
    * Retorna uma lista formatada de pacientes ordenados por Nome.
    * 
    * @param {ConsultaController} consulta_controller - Controlador de consultas para verificar agendamentos futuros.
    * @returns {string} - A lista formatada.
    */
    getPacientesOrdenadosPorNome(consulta_controller){
        // Ordenar os pacientes pelo nome
        const pacientesOrdenados = [...this.pacientes.values()].sort((a, b) => a.nome.localeCompare(b.nome));
        return this.geraListaPacientes(pacientesOrdenados, consulta_controller);
    }

}