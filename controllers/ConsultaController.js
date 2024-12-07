import { ConsultaBuilder } from "../models/ConsultaBuilder.js";
import { DateTime } from "luxon";
import { ErrorCodes } from "../utils/Error.js";
import { Consulta } from "../models/Consulta.js";
import PacienteController from "./PacienteController.js";

import { Op } from "sequelize";

/**
* Classe Singleton responsável por gerenciar consultas odontológicas.
* Permite adicionar, remover e listar consultas, além de realizar validações e verificar agendamentos futuros.
*/
class ConsultaController{

    /**
    * Builder para criar objetos de consulta.
    * @type {ConsultaBuilder}
    */
    consulta_builder;

    /**
    * Construtor da classe ConsultaController.
    * Inicializa o ConsultaBuilder.
    */
    constructor(){
        if (ConsultaController.instance) 
            return ConsultaController.instance; // Retorna a instância existente
        
        this.consulta_builder = new ConsultaBuilder();
        ConsultaController.instance = this; // Salva a instância
    }

    /**
    * Inicia a criação de uma nova consulta limpando o estado atual do builder.
    */
    iniciarNovaConsulta(){
        this.consulta_builder.clear();
    }

    /**
    * Define o CPF do paciente para a consulta em criação.
    * 
    * @async
    * @param {string} cpf - CPF do paciente.
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    async setCpf(cpf){
        // Berifica se o paciente existe
        if(!(await PacienteController.exists(cpf)))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        // Verifica se o paciente já possui uma consulta marcada
        if(await this.hasAgendamentosFuturos(cpf))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_AGENDADO};

        return this.consulta_builder.setCpf(cpf)
    }

    /**
    * Define a data da consulta.
    * 
    * @param {string} data - Data no formato "dd/MM/yyyy".
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    setDataConsulta(data) {
        return this.consulta_builder.setDataConsulta(data);
    }

    /**
    * Define a hora inicial da consulta.
    * 
    * @param {string} horaInicial - Hora inicial no formato "HHmm".
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    setHoraInicial(horaInicial) {
       return this.consulta_builder.setHoraInicial(horaInicial);
    }

    /**
    * Define a hora final da consulta.
    * 
    * @param {string} horaFinal - Hora final no formato "HHmm".
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    setHoraFinal(horaFinal) {
        return this.consulta_builder.setHoraFinal(horaFinal);
    }

    /**
     * @async
     * Verifica se um consulta sobrepoẽ alguma outra já agendada.
     * @param {Consulta} consulta - Instância de consulta para ser comparada
     * @returns {boolean} Retorna true se sobrepõe alguma consulta, senão retorna false
     */
    async isSobreposta(consulta){
        const consultas = await Consulta.findAll();
        for( const consulta_cadastrada of consultas)
            if(consulta.isSobreposta(consulta_cadastrada))
                return true;

        return false;
    }

    /**
    * Finaliza a criação da consulta e a adiciona ao mapa de consultas.
    * 
    * @async
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    async addConsulta(){
        const resposta = await this.consulta_builder.build();
        if(!resposta.success)
            return resposta;

        const consulta = resposta.consulta;

        if(await this.hasAgendamentosFuturos(consulta.cpf_paciente))
            return {success: false, error: ErrorCodes.ERR_CONSULTA_DUPLA};

        if(await this.isSobreposta(consulta))
            return {success: false, error: ErrorCodes.ERR_CONSULTA_SOBREPOSTA};

        try {
            await consulta.save();
        } catch (error) {
            return {success: false, error: ErrorCodes.ERR_BD_FALHA_CONEXAO};
        }
        return {success: true};
    }

    /**
    * Remove uma consulta específica de um paciente.
    * 
    * @async
    * @param {string} cpf - CPF do paciente.
    * @param {string} data_consulta - Data da consulta no formato "dd/MM/yyyy".
    * @param {string} hora_inicial - Hora inicial no formato "HHmm".
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    async removeConsulta(cpf, data_consulta, hora_inicial){
        // Verifica se existe o paciente
        if(!(await PacienteController.exists(cpf)))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        const agora = DateTime.now();
        const data_hora_consulta = DateTime.fromFormat(data_consulta+hora_inicial, "dd/MM/yyyyHHmm");

        // Verifica se a data da consulta a ser pesquisada é passada
        if(data_hora_consulta.diff(agora).toMillis() <= 0)
            return {success: false, error: ErrorCodes.ERR_CONSULTA_NAO_ENCONTRADA};

        try{
            const consultas_deletadas =  await Consulta.destroy({
                where: {
                    cpf_paciente: cpf,
                    data_consulta: data_hora_consulta.toFormat("yyyy-MM-dd"),
                    hora_inicial: data_hora_consulta.toFormat("HH:mm:00"),
                }
            });

            if(consultas_deletadas > 0)
                return {success: true};

            return {success: false, error: ErrorCodes.ERR_CONSULTA_NAO_ENCONTRADA};
        } catch(error) {
            return {success: false, error: ErrorCodes.ERR_BD_FALHA_CONEXAO};
        }
    }

    /**
     * Obtem todas as consultas de um paciente
     * 
     * @async
     * @param {String} cpf 
     * @returns {Consulta[] | null} - Retorna as consultas de um paciente, se não tiver consultas retorna nulo
     */
    async #getConsultasPaciente(cpf){
        return await Consulta.findAll({where: {cpf_paciente: cpf}});
    }


    /**
    * Verifica se o paciente possui agendamentos futuros.
    * 
    * @async
    * @param {string} cpf - CPF do paciente.
    * @returns {boolean} Retorna true se houver agendamentos futuros, caso contrário, false.
    */
    async hasAgendamentosFuturos(cpf){
        // Verifica se o paciente possui agendamentos futuros
        const consultas_paciente = await this.#getConsultasPaciente(cpf);
        if (consultas_paciente && consultas_paciente.some((c) => !c.isConsultaPassada())) 
            return true;

        return false;
    }

    /**
    * Lista consultas futuras de um paciente.
    * 
    * @async
    * @param {string} cpf - CPF do paciente.
    * @returns {{success: boolean, error?: number, consultas?:Array<Consulta>}} Objeto contendo o status da operação, as consultas futuras ou um código de erro.
    */
    async getAgendamentosFuturos(cpf){
        const consultas = await this.#getConsultasPaciente(cpf);
        if(!consultas)
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        const consultas_futuras = consultas.filter((consulta) => !consulta.isConsultaPassada());
        return {success: true, consultas: consultas_futuras};
    }

    /**
    * Lista todas as consultas, podendo filtrar por período.
    * 
    * @async
    * @param {boolean} filtro_periodo - Indica se deve filtrar por período.
    * @param {string} [data_inicial=null] - Data inicial no formato "dd/MM/yyyy".
    * @param {string} [data_final=null] - Data final no formato "dd/MM/yyyy".
    * @returns {string} String formatada com a lista de consultas.
    */
    async listarConsultas(filtro_periodo=false, data_inicial=null, data_final=null){

        let lista_consultas;
        if(filtro_periodo)
            lista_consultas = await this.#filtrarConsultas(data_inicial, data_final);
        else
            lista_consultas = await Consulta.findAll({order: [['data_consulta', 'ASC'], ['hora_inicial', 'ASC']]});


        // Cabeçalho
        var resultado = "-------------------------------------------------------------\n";
        resultado    += "   Data    H.Ini H.Fim Tempo Nome                   Dt.Nasc. \n";
        resultado    += "-------------------------------------------------------------\n";

        for(let i=0; i < lista_consultas.length; i++){
            const consulta = lista_consultas[i];

            //Para evitar que a mesma data seja repetida na primeira coluna verifico se ele é igual a data da consulta anterior 
            var data_consulta = "";
            if((i === 0) || !lista_consultas[i].data_consulta.equals(lista_consultas[i-1].data_consulta)){
                data_consulta = consulta.data_consulta.toFormat("dd/MM/yyyy")
            }

            resultado += `${data_consulta.padEnd(10, ' ')} `;
            resultado += `${consulta.hora_inicial.toFormat("HH:mm")} `;
            resultado += `${consulta.hora_final.toFormat("HH:mm")} `;
            resultado += `${consulta.hora_final.diff(consulta.hora_inicial, ["hours", "minutes"]).toFormat("hh:mm")} `;

            const paciente = await PacienteController.getPaciente(consulta.cpf_paciente);
            resultado += `${paciente.nome.padEnd(21, ' ')} ${paciente.data_nasc.toFormat("dd/MM/yyyy")}\n`;
        }
        

        resultado    += "-------------------------------------------------------------";
        return resultado;
    }

    /**
    * Filtra uma lista de consultas por um intervalo de datas.
    * 
    * @async
    * @param {Array<Consulta>} lista_consultas - Lista de consultas a ser filtrada.
    * @param {string} data_inicial - Data inicial do intervalo no formato "dd/MM/yyyy".
    * @param {string} data_final - Data final do intervalo no formato "dd/MM/yyyy".
    * 
    * @returns {Array<Consulta>} - Uma nova lista contendo apenas as consultas que estão no intervalo especificado.
    * 
    * @throws {Error} - Lança um erro se `data_inicial` ou `data_final` não forem fornecidas.
    */
    async #filtrarConsultas(data_inicial, data_final){
        if(!(data_inicial && data_final))
            throw new Error("Listar consultas com período deve ter data inicial e final!");


        const data_inicial_formata  = DateTime.fromFormat(data_inicial, "dd/MM/yyyy");
        const data_final_formata    = DateTime.fromFormat(data_final, "dd/MM/yyyy");

        const consultas = await Consulta.findAll({
            where: {
                data_consulta: {
                    [Op.between]: [data_inicial_formata.toSQLDate(), data_final_formata.toSQLDate()],
                }
            },
            order: [['data_consulta', 'ASC'], ['hora_inicial', 'ASC']], // Ordenação opcional
        });

        return consultas;

    }

    /**
    * Valida o formato da hora inicial.
    * 
    * @param {string} hora_inicial - Hora inicial no formato "HHmm".
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    validaHoraInicial(hora_inicial){
        const HoraInicial = DateTime.fromFormat(hora_inicial, "HHmm");

        if (!HoraInicial.isValid) {
            return { success: false, error: ErrorCodes.ERR_HORA_INVALIDA};
        }

        return { success: true };
    }

    /**
    * Valida o formato e consistência da data.
    * 
    * @param {string} data - Data no formato "dd/MM/yyyy".
    * @param {string} [data_inicial=null] - Data inicial para validação de intervalo.
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    validaData(data, data_inicial=null){
        const Data = DateTime.fromFormat(data, "dd/MM/yyyy");

        if (!Data.isValid) {
            return { success: false, error: ErrorCodes.ERR_DATA_CONSULTA_INVALIDA };
        }

        if(data_inicial){
            const DataInicial = DateTime.fromFormat(data_inicial, "dd/MM/yyyy");

            if(Data.diff(DataInicial, ['days']) < 0)
                return { success: false, error: ErrorCodes.ERR_DATA_FINAL_MENOR_INICIAL };
        }

        return { success: true };
    }
};

export default new ConsultaController();