import { ConsultaBuilder } from "../models/ConsultaBuilder.js";
import { DateTime } from "luxon";
import { ErrorCodes } from "../utils/Error.js";
import { Consulta } from "../models/Consulta.js";
import { PacienteController } from "./PacienteController.js";

/**
* Classe responsável por gerenciar consultas odontológicas.
* Permite adicionar, remover e listar consultas, além de realizar validações e verificar agendamentos futuros.
*/
export class ConsultaController{

    /**
    * Mapa que armazena consultas associadas aos CPFs dos pacientes.
    * @type {Map<string, Consulta>}
    */
    consultas;

    /**
    * Builder para criar objetos de consulta.
    * @type {ConsultaBuilder}
    */
    consulta_builder;

    /**
    * Construtor da classe ConsultaController.
    * Inicializa o mapa de consultas e o ConsultaBuilder.
    */
    constructor(){
        this.consultas = new Map();
        this.consulta_builder = new ConsultaBuilder();
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
    * @param {string} cpf - CPF do paciente.
    * @param {PacienteController} paciente_controller - Controlador de pacientes para validar o CPF.
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    setCpf(cpf, paciente_controller){
        if(!paciente_controller.exists(cpf))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

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
     * Verifica se um consulta sobrepoẽ alguma outra já agendada.
     * @param {Consulta} consulta - Instância de consulta para ser comparada
     * @returns {boolean} Retorna true se sobrepõe alguma consulta, senão retorna false
     */
    isSobreposta(consulta){
        for( const [chave, consultas_paciente] of this.consultas.entries())
            for( const consulta_cadastrada of consultas_paciente)
                if(consulta.isSobreposta(consulta_cadastrada))
                    return true;

        return false;
    }

    /**
    * Finaliza a criação da consulta e a adiciona ao mapa de consultas.
    * 
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    addConsulta(){
        const resposta = this.consulta_builder.build();
        if(!resposta.success)
            return resposta;

        const consulta = resposta.consulta;

        if(this.hasAgendamentosFuturos(consulta.cpf_paciente))
            return {success: false, error: ErrorCodes.ERR_CONSULTA_DUPLA};

        if(this.isSobreposta(consulta))
            return {success: false, error: ErrorCodes.ERR_CONSULTA_SOBREPOSTA};

        if(!this.consultas.has(consulta.cpf_paciente))
            this.consultas.set(consulta.cpf_paciente, []);

        this.consultas.get(consulta.cpf_paciente).push(consulta);

        return {success: true};
    }

    /**
    * Remove uma consulta específica de um paciente.
    * 
    * @param {string} cpf - CPF do paciente.
    * @param {string} data_consulta - Data da consulta no formato "dd/MM/yyyy".
    * @param {string} hora_inicial - Hora inicial no formato "HHmm".
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    removeConsulta(cpf, data_consulta, hora_inicial){

        if(!this.consultas.has(cpf))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        const agora = DateTime.now();
        const data_hora_consulta = DateTime.fromFormat(data_consulta+hora_inicial, "dd/MM/yyyyHHmm");

        if(data_hora_consulta.diff(agora).toMillis() <= 0)
            return {success: false, error: ErrorCodes.ERR_CONSULTA_NAO_ENCONTRADA};

        const consultas_paciente = this.consultas.get(cpf);

        for (let i = 0; i < consultas_paciente.length; i++) {
            if(data_consulta === consultas_paciente[i].data_consulta.toFormat("dd/MM/yyyy") && consultas_paciente[i].hora_inicial.toFormat("HHmm") === hora_inicial){
                consultas_paciente.splice(i, 1);
                return {success: true};
            }
        }

        return {success: false, error: ErrorCodes.ERR_CONSULTA_NAO_ENCONTRADA};
    }

    /**
    * Remove todas as consultas de um paciente.
    * 
    * @param {string} cpf - CPF do paciente.
    * @returns {{success: boolean, error?: number}} Objeto contendo o status da operação e, em caso de erro, um código de erro.
    */
    removeConsultasPaciente(cpf){

        if(!this.consultas.has(cpf))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        this.consultas.delete(cpf);
        return {success: true};
    }

    /**
    * Verifica se o paciente possui agendamentos futuros.
    * 
    * @param {string} cpf - CPF do paciente.
    * @returns {boolean} Retorna true se houver agendamentos futuros, caso contrário, false.
    */
    hasAgendamentosFuturos(cpf){

        // Verifica se o paciente possui agendamentos futuros
        const consultas_paciente = this.consultas.get(cpf);
        if (consultas_paciente && consultas_paciente.some((c) => !c.isConsultaPassada())) 
            return true;

        return false;
    }

    /**
    * Lista consultas futuras de um paciente.
    * 
    * @param {string} cpf - CPF do paciente.
    * @returns {{success: boolean, error?: number, consultas?:Array<Consulta>}} Objeto contendo o status da operação, as consultas futuras ou um código de erro.
    */
    getAgendamentosFuturos(cpf){
        if(!this.consultas.has(cpf))
            return {success: false, error: ErrorCodes.ERR_PACIENTE_NAO_CADASTRADO};

        // Verifica se o paciente possui agendamentos futuros
        const consultas_paciente = this.consultas.get(cpf);
        var consultas_futuras = consultas_paciente.filter((consulta) => !consulta.isConsultaPassada());

        return {success: true, consultas: consultas_futuras};
    }

    /**
    * Lista todas as consultas, podendo filtrar por período.
    * 
    * @param {PacienteController} paciente_controller - Controlador de pacientes para obter informações adicionais.
    * @param {boolean} filtro_periodo - Indica se deve filtrar por período.
    * @param {string} [data_inicial=null] - Data inicial no formato "dd/MM/yyyy".
    * @param {string} [data_final=null] - Data final no formato "dd/MM/yyyy".
    * @returns {string} String formatada com a lista de consultas.
    */
    listarConsultas(paciente_controller, filtro_periodo=false, data_inicial=null, data_final=null){

        function concatDataEHora(consulta) {
            return DateTime.fromObject({
                year: consulta.data_consulta.year,
                month: consulta.data_consulta.month,
                day: consulta.data_consulta.day,
                hour: consulta.hora_inicial.hour,
                minute: consulta.hora_inicial.minute
            }).toMillis();
        }   

        var lista_consultas = [...this.consultas.values()].flat();
        if(filtro_periodo)
            lista_consultas = this.#filtrarConsultas(lista_consultas, data_inicial, data_final);

        lista_consultas = lista_consultas.sort(
            (a, b) => concatDataEHora(a) - concatDataEHora(b)
        );

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

            const paciente = paciente_controller.getPaciente(consulta.cpf_paciente);
            resultado += `${paciente.nome.padEnd(21, ' ')} ${paciente.data_nasc.toFormat("dd/MM/yyyy")}\n`;
        }
        

        resultado    += "-------------------------------------------------------------";
        return resultado;
    }

    /**
    * Filtra uma lista de consultas por um intervalo de datas.
    * 
    * @param {Array<Consulta>} lista_consultas - Lista de consultas a ser filtrada.
    * @param {string} data_inicial - Data inicial do intervalo no formato "dd/MM/yyyy".
    * @param {string} data_final - Data final do intervalo no formato "dd/MM/yyyy".
    * 
    * @returns {Array<Consulta>} - Uma nova lista contendo apenas as consultas que estão no intervalo especificado.
    * 
    * @throws {Error} - Lança um erro se `data_inicial` ou `data_final` não forem fornecidas.
    */
    #filtrarConsultas(lista_consultas, data_inicial, data_final){
        if(!(data_inicial && data_final))
            throw new Error("Listar consultas com período deve ter data inicial e final!");

        const data_inicial_formata  = DateTime.fromFormat(data_inicial, "dd/MM/yyyy");
        const data_final_formata    = DateTime.fromFormat(data_final, "dd/MM/yyyy");

        return lista_consultas.filter(consulta => {
            const data = consulta.data_consulta;
            return (
                data >= data_inicial_formata.startOf('day') &&
                data <= data_final_formata.endOf('day')
            );
        });
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