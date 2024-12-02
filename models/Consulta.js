import { DateTime } from "luxon";
import { Model, DataTypes } from "sequelize";

/**
 * Classe que representa uma Consulta no banco de dados
 */
export class Consulta extends Model{
    /**
     * @property {string} cpf_paciente - CPF do paciente associado à consulta.
     * @property {DateTime} data_consulta - Data da consulta no formato YYYY-MM-DD.
     * @property {DateTime} hora_inicial - Hora de início da consulta no formato HH:mm:ss.
     * @property {DateTime} hora_final - Hora de término da consulta no formato HH:mm:ss.
     */

    static init(sequelize){
        super.init({

            cpf_paciente:{
                type: DataTypes.STRING,
                allowNull: false,
            },

            data_consulta: {
                type: DataTypes.DATEONLY,
                /*Esse getter é utilizado para ser compativel com as outras partes do código que utilizam o luxon, 
                sem a necessidade de refatorar tudo*/
                get() {
                    const rawValue = this.getDataValue("data_consulta")
                    return rawValue ? DateTime.fromFormat(rawValue, "yyyy-MM-dd") : null;
                }
            },

            hora_inicial: {
                type: DataTypes.TIME,
                get(){
                    const rawValue = this.getDataValue("hora_inicial")
                    return rawValue ? DateTime.fromFormat(rawValue, "HH:mm") : null;
                }
            },

            hora_final: {
                type: DataTypes.TIME,
                get(){
                    const rawValue = this.getDataValue("hora_final")
                    return rawValue ? DateTime.fromFormat(rawValue, "HH:mm") : null;
                }
            },

        }, {sequelize, modelName: "consulta", tableName: "consultas", timestamps: false,})
    }

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

}