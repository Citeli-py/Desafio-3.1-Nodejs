import { Model, DataTypes } from "sequelize";
import { DateTime } from "luxon";

/**
* Classe que representa um Paciente.
* @property {string} cpf - CPF do paciente.
* @property {string} nome - Nome do paciente.
* @property {DateTime} data_nasc - Data de nascimento do paciente no formato ISO (yyyy-MM-dd).
*/
export class Paciente extends Model{
  
    static init(sequelize){
        super.init({
            cpf: {
                type: DataTypes.STRING(11),
                allowNull: false,
                unique: true,
            },

            nome: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            data_nasc: {
                type: DataTypes.DATEONLY,
                /*Esse getter é utilizado para ser compativel com as outras partes do código que utilizam o luxon, 
                sem a necessidade de refatorar tudo*/
                get() {
                    const rawValue = this.getDataValue("data_nasc")
                    return rawValue ? DateTime.fromFormat(rawValue, "yyyy-MM-dd") : null;
                },
            },

        }, {sequelize, modelName: "paciente", tableName: "pacientes", timestamps: false,})
    }
};