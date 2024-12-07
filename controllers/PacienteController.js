import {PacienteBuilder} from "../models/PacienteBuilder.js"
import { DateTime } from "luxon";
import { ErrorCodes } from "../utils/Error.js";
import ConsultaController from "./ConsultaController.js";
import { Paciente } from "../models/Paciente.js";

import { Sequelize } from "sequelize";

/**
 * @class
* Controlador Singleton responsável por gerenciar as operações relacionadas aos pacientes.
* Inclui funcionalidades para adicionar, remover, validar e listar pacientes,
* bem como verificar agendamentos associados.
*/
class PacienteController{

    /**
    * Inicializa uma nova instância de PacienteController.
    * 
    * - Utiliza um `PacienteBuilder` para gerenciar a construção de pacientes.
    */
    constructor() {
        if (PacienteController.instance) 
            return PacienteController.instance; // Retorna a instância existente
        
        /** 
        * @type {PacienteBuilder}
        */
        this.paciente_builder = new PacienteBuilder();

        PacienteController.instance = this; // Salva a instância
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
    * @async
    * @param {string} cpf - O CPF do paciente a ser validado.
    * @returns {{success: boolean, error?: number}} - Um objeto contendo `success: true` se válido ou um erro com código correspondente.
    */
    async validaCpf(cpf){
        if(!this.paciente_builder.validaCpf(cpf))
            return {success: false, error: ErrorCodes.ERR_CPF_INVALIDO};

        if(!(await this.exists(cpf)))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        return { success: true }
    }

    /**
    * Define o CPF no builder e verifica se já existe.
    * 
    * @async
    * @param {string} cpf - O CPF do paciente.
    * @returns {{success: boolean, error?: number}} - Um objeto contendo `success: true` se válido ou um erro com código correspondente.
    */
    async setCpf(cpf){
        if(await this.exists(cpf))
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
    * @async
    * @returns {{success: boolean, error?: number}} - Resultado da operação, indicando sucesso ou erro.
    */
    async addPaciente(){
        const paciente = await this.paciente_builder.build();
        if(!paciente.success)
            return paciente;

        // Fazer tratamento de erros
        await paciente.paciente.save();

        return {success: true};
    }

    /**
    * Remove um paciente do registro, verificando agendamentos futuros antes.
    * 
    * @async
    * @param {string} cpf - O CPF do paciente a ser removido.
    * @returns {{success: boolean, error?: number}} - Resultado da operação, indicando sucesso ou erro.
    */
    async removePaciente(cpf){
        
        const paciente = await Paciente.findOne({where: {cpf: cpf}});
        // Verifica se o paciente existe
        if (!paciente) 
            return { success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO };
        
        // Verifica se o paciente possui agendamentos futuros
        if(await ConsultaController.hasAgendamentosFuturos(cpf))
            return { success: false, error: ErrorCodes.ERR_PACIENTE_AGENDADO };
        

        // Remove o paciente e seus agendamentos
        paciente.destroy();

        return { success: true};
    }

    /**
    * Retorna um paciente pelo CPF.
    * 
    * @async
    * @param {string} cpf - O CPF do paciente.
    * @returns {Paciente|null} - O paciente encontrado ou `null` se não existir.
    */
    async getPaciente(cpf){
        return await Paciente.findOne({where: {cpf: cpf}});
    }

    /**
    * Verifica se um paciente existe no registro.
    * 
    * @async
    * @param {string} cpf - O CPF do paciente.
    * @returns {boolean} - `true` se o paciente existe, caso contrário `false`.
    */
    async exists(cpf) {
        const paciente = await Paciente.findOne({where: {cpf: cpf}});
        return paciente !== null;
    }


    /**
    * Gera uma lista formatada de pacientes com suas informações e agendamentos futuros.
    * 
    * @param {Array<Paciente>} lista_pacientes - Lista de pacientes a serem formatados.
    * @returns {string} - A lista formatada.
    */
    async geraListaPacientes(lista_pacientes){
        // Cabeçalho da tabela
        let resultado = '------------------------------------------------------------\n';
        resultado +=    'CPF         Nome                           Dt.Nasc.    Idade\n';
        resultado +=    '------------------------------------------------------------\n';

        // Iterar sobre os pacientes
        for(const paciente of lista_pacientes){
            // calcular idade do paciente
            const hoje = DateTime.now();
            const idade = Math.floor(hoje.diff(paciente.data_nasc, 'years').years);

            // Adicionar as informações do paciente
            resultado += `${paciente.cpf} ${paciente.nome.padEnd(30, ' ')} ${paciente.data_nasc.toFormat('dd/MM/yyyy')} ${String(idade).padStart(6)}\n`;

            // Verificar se o paciente tem agendamento futuro
            const agendamento = await ConsultaController.getAgendamentosFuturos(paciente.cpf);            
            if (agendamento.success) {
                // Adicionar informações de agendamento futuro
                agendamento.consultas.forEach((consulta) => {
                    resultado += "".padEnd(12) +`Agendado para: ${consulta.data_consulta.toFormat('dd/MM/yyyy')}\n`
                    resultado += "".padEnd(12)+`${consulta.hora_inicial.toFormat('HH:mm')} às ${consulta.hora_final.toFormat('HH:mm')}\n`;
                });
            }
        };

        resultado +=  '------------------------------------------------------------\n';

        return resultado;
    }

    /**
    * Retorna uma lista formatada de pacientes ordenados por CPF.
    * 
    * @returns {string} - A lista formatada.
    */
    async getPacientesOrdenadosPorCpf(){
        // Ordenar os pacientes pelo CPF
        const pacientesOrdenados = await Paciente.findAll({
            order: [[Sequelize.cast(Sequelize.col('cpf'), 'BIGINT'), 'ASC']]
        });
        return await this.geraListaPacientes(pacientesOrdenados);
    }

    /**
    * Retorna uma lista formatada de pacientes ordenados por Nome.
    * 
    * @returns {string} - A lista formatada.
    */
    async getPacientesOrdenadosPorNome(){
        // Ordenar os pacientes pelo nome
        const pacientesOrdenados = await Paciente.findAll({order: ['nome']});
        return await this.geraListaPacientes(pacientesOrdenados);
    }

}

export default new PacienteController();