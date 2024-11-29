import { DateTime } from 'luxon';
import { Consulta } from './Consulta.js';
import { ErrorCodes } from "../utils/Error.js";

/*
* Classe responsável por construir objetos do tipo Consulta de forma controlada.
* Valida as informações fornecidas antes de criar a consulta.
*/
export class ConsultaBuilder {
    #cpf_paciente;
    #data_consulta;
    #hora_inicial;
    #hora_final;

    /**
    * Define o CPF do paciente.
    * @param {string} cpf - O CPF do paciente.
    * @returns {{success: boolean}} Um objeto indicando sucesso ou erro.
    */

    setCpf(cpf){
        this.#cpf_paciente = cpf;
        return {success: true}
    }

    /**
    * Define a data da consulta.
    * @param {string} data - A data da consulta no formato "dd/MM/yyyy".
    * @returns {{success: boolean, error?: Number}} Um objeto indicando sucesso ou erro.
    */
    setDataConsulta(data) {
        const novaData = DateTime.fromFormat(data, "dd/MM/yyyy");
        const hoje = DateTime.now();

        if (!novaData.isValid) {
            return { success: false, error: ErrorCodes.ERR_DATA_CONSULTA_INVALIDA };
        }

        if (novaData.diff(hoje.startOf('day'), 'days').days < 0) {
            return { success: false, error: ErrorCodes.ERR_DATA_CONSULTA_ANTERIOR };
        }

        if (novaData.diff(hoje.startOf('day'), 'days').days === 0 && !this.#isAberto(hoje)) {
            return { success: false, error: ErrorCodes.ERR_DATA_CONSULTA_HOJE_FECHADO };
        }

        this.#data_consulta = novaData;
        return { success: true };
    }

    /**
    * Define o horário inicial da consulta.
    * @param {string} horaInicial - O horário inicial no formato "HHmm".
    * @returns {{success: boolean, error?: Number}} Um objeto indicando sucesso ou erro.
    */
    setHoraInicial(horaInicial) {

        if (!this.#data_consulta) {
            return { success: false, error: ErrorCodes.ERR_HORA_SEM_DATA_CONSULTA };
        }

        const novaHoraInicial = DateTime.fromFormat(horaInicial, "HHmm");
        if (!novaHoraInicial.isValid) {
            return { success: false, error: ErrorCodes.ERR_HORA_INVALIDA};
        }

        if (novaHoraInicial.minute % 15 !== 0) {
            return { success: false, error: ErrorCodes.ERR_HORA_HORARIO_INVALIDO };
        }

        if (!this.#isAberto(novaHoraInicial) || novaHoraInicial.hour >= 19) {
            return { success: false, error: ErrorCodes.ERR_HORA_HORARIO_FECHADO };
        }

        const agora = DateTime.now();
        if (this.#data_consulta.diff(agora.startOf('day'), 'days').days === 0 && novaHoraInicial.diff(agora, 'hours').hours < 0) {
            return { success: false, error: ErrorCodes.ERR_HORA_PASSADA };
        }

        this.#hora_inicial = novaHoraInicial;
        return { success: true };
    }

    /**
    * Define o horário final da consulta.
    * @param {string} horaFinal - O horário final no formato "HHmm".
    * @returns {{success: boolean, error?: Number}} Um objeto indicando sucesso ou erro.
    */
    setHoraFinal(horaFinal) {
        if (!this.#data_consulta) {
            return { success: false, error: ErrorCodes.ERR_HORA_SEM_DATA_CONSULTA };
        }

        if (!this.#hora_inicial) {
            return { success: false, error: ErrorCodes.ERR_HORA_SEM_HORA_INICIAL};
        }

        const novaHoraFinal = DateTime.fromFormat(horaFinal, "HHmm");
        if (!novaHoraFinal.isValid) {
            return { success: false, error: ErrorCodes.ERR_HORA_INVALIDA};
        }

        if (novaHoraFinal.minute % 15 !== 0) {
            return { success: false, error: ErrorCodes.ERR_HORA_HORARIO_INVALIDO };
        }

        if (!this.#isAberto(novaHoraFinal)) {
            return { success: false, error: ErrorCodes.ERR_HORA_HORARIO_FECHADO };
        }

        if (novaHoraFinal <= this.#hora_inicial) {
            return { success: false, error: ErrorCodes.ERR_HORA_FINAL_ANTES_INICIAL};
        }

        this.#hora_final = novaHoraFinal;
        return { success: true };
    }

    /**
    * Limpa todos os dados da consulta.
    */
    clear(){
        this.#data_consulta = null;
        this.#hora_inicial = null;
        this.#hora_final = null;
    }

    /**
    * Cria e retorna uma instância da classe Consulta.
    * @returns {{success: boolean, error?: Number , consulta?: Consulta}} Um objeto contendo a consulta criada ou um erro, caso os dados estejam incompletos.
    */
    build() {
        if (!this.#cpf_paciente || !this.#data_consulta || !this.#hora_inicial || !this.#hora_final) {
            return { success: false, error: ErrorCodes.ERR_CONSULTA_INCOMPLETA };
        }

        const consulta = new Consulta();
        consulta.cpf_paciente = this.#cpf_paciente
        consulta.data_consulta = this.#data_consulta;
        consulta.hora_inicial = this.#hora_inicial;
        consulta.hora_final = this.#hora_final;

        this.clear();
        return { success: true, consulta };
    }

    /**
    * Verifica se o horário fornecido está dentro do período de funcionamento.
    * @param {DateTime} data - O horário a ser verificado.
    * @returns {boolean} Retorna `true` se o horário está dentro do expediente, `false` caso contrário.
    * @private
    */
    #isAberto(data) {
        const [hora_aberto, hora_fechado] = [8, 19];
        return data.hour >= hora_aberto && data.hour <= hora_fechado;
    }
}
