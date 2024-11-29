import { DateTime } from "luxon";

/**
* Classe que representa uma consulta médica.
*/
export class Consulta {
    /**
    * @property {string} cpf_paciente - CPF do paciente associado à consulta.
    */
    cpf_paciente;

    /**
    * @property {DateTime} data_consulta - Data da consulta como uma instância de Luxon.
    */
    data_consulta;

    /**
    * @property {DateTime} hora_inicial - Hora de início da consulta como uma instância de Luxon.
    */
    hora_inicial;

    /**
    * @property {DateTime} hora_final - Hora de término da consulta como uma instância de Luxon.
    */
    hora_final;
    
    /**
    * Verifica se a consulta atual sobrepõe outra consulta.
    *
    * @param {Consulta} consulta - Outra instância de consulta a ser comparada.
    * @returns {boolean} Retorna `true` se as consultas sobrepõem, caso contrário, `false`.
    */
    isSobreposta(consulta){
        // Verifica se uma consulta sobrepõe a outra
        if(!this.data_consulta.equals(consulta.data_consulta))
            return false;

        // Verifica se uma consulta sobrepõe a outra
        if((this.hora_inicial >= consulta.hora_final) || (this.hora_final <= consulta.hora_inicial))
            return false;

        return true
    }

    /**
    * Verifica se a consulta já passou.
    *
    * @returns {boolean} Retorna `true` se a consulta já ocorreu ou foi perdida, caso contrário, `false`.
    */
    isConsultaPassada(){
        const hoje = DateTime.now();

        if(this.data_consulta.diff(hoje.startOf('day')).days < 0)
            return true;

        // Estou considerando que caso você tenha perdido o horario de entrar na consulta ela já não vale mais
        if(this.hora_inicial.diff(hoje.startOf('hour')).hours < 0)
            return true;

        return false;
    }
};