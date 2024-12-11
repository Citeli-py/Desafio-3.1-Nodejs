import { DateTime } from 'luxon';
import { Paciente } from './Paciente.js';
import { ErrorCodes } from '../utils/Error.js';

/**
 * Builder para criar instâncias da classe Paciente.
 * @property {string} cpf
 * @property {string} nome
 * @property {DateTime} data_nasc
 */
export class PacienteBuilder {
    #cpf;
    #nome;
    #data_nasc;

    /**
    * Valida se o CPF fornecido é válido.
    * 
    * @param {string} cpf - CPF a ser validado.
    * @returns {boolean} Retorna `true` se o CPF for válido, caso contrário, `false`.
    */
    validaCpf(cpf){
        if (!this.#validaCodigoCpf(cpf)) 
            return false;

        return true;
    }

    /**
    * Define o CPF do paciente.
    * 
    * @param {string} novoCpf - CPF do paciente.
    * @returns {{sucess: boolean, error?: number}} Objeto com a propriedade `success` indicando sucesso ou falha.
    */
    setCpf(novoCpf){
        if (!this.validaCpf(novoCpf)) {
            return { success: false, error: ErrorCodes.ERR_CPF_INVALIDO };
        }

        this.#cpf = novoCpf;
        return { success: true };
    }

    /**
    * Valida o nome do paciente.
    * 
    * @param {string} nome - Nome a ser validado.
    * @returns {{sucess: boolean, error?: number}} Objeto com a propriedade `success` indicando sucesso ou falha.
    */
    validaNome(nome){
        if (nome.length < 5)
            return { success: false, error: ErrorCodes.ERR_NOME_INVALIDO };

        return {success: true}
    }

    /**
    * Define o nome do paciente.
    * 
    * @param {string} novoNome - Nome do paciente.
    * @returns {{sucess: boolean, error?: number}} Objeto com a propriedade `success` indicando sucesso ou falha.
    */
    setNome(novoNome){
        const result = this.validaNome(novoNome);

        if(result.success)
            this.#nome = novoNome;
        
        return result;
    }

    /**
    * Define a data de nascimento do paciente.
    * 
    * @param {string} novaData - Data de nascimento no formato "dd/MM/yyyy".
    * @returns {{sucess: boolean, error?: number}} Objeto com a propriedade `success` indicando sucesso ou falha.
    */
    setData_nasc(novaData){
        // Converte a string para uma data Luxon usando o formato "dd/MM/yyyy"
        novaData = DateTime.fromFormat(novaData, "dd/MM/yyyy");

        if (!novaData.isValid) 
            return { success: false, error: ErrorCodes.ERR_DATA_PACIENTE_INVALIDA };


        const idade = DateTime.now().diff(novaData, "years").years;
        if (idade < 13) 
            return { success: false, error: ErrorCodes.ERR_IDADE_INSUFICIENTE};
        

        this.#data_nasc = novaData;
        return { success: true };
    }

    /**
    * Limpa os dados armazenados no builder.
    */
    clear(){
        this.#cpf = null;
        this.#nome = null;
        this.#data_nasc = null;
    }

    /**
    * Constrói uma instância de Paciente com os dados fornecidos.
    * 
    * @async
    * @returns {{success: boolean, error?: string, paciente?: Paciente}} Objeto contendo `success` e, em caso de sucesso, o paciente criado.
    */
    async build() {
        if (!this.#cpf || !this.#nome || !this.#data_nasc) {
            return {
                success: false,
                error: ErrorCodes.ERR_PACIENTE_INCOMPLETO
            };
        }

        const paciente = new Paciente({
            cpf:        this.#cpf,
            nome:       this.#nome,
            data_nasc:  this.#data_nasc.toFormat("yyyy-MM-dd"),
        });

        this.clear();
        return { success: true, paciente };
    }

    /**
    * Verifica se uma string contém apenas números.
    * 
    * @param {string} str - String a ser verificada.
    * @returns {boolean} Retorna `true` se a string for numérica, caso contrário, `false`.
    * @private
    */
    #isNumerico(str) {
        return /^\d+$/.test(str);
    }

    /**
    * Valida o código de um CPF com base nos dígitos verificadores.
    * 
    * @param {string} cpf - CPF a ser validado.
    * @returns {boolean} Retorna `true` se o CPF for válido, caso contrário, `false`.
    * @private
    */
    #validaCodigoCpf(cpf) {
        if (!cpf || cpf.length !== 11 || !this.#isNumerico(cpf)) 
            return false;

        let digitoJ = Number(cpf[9]);
        let digitoK = Number(cpf[10]);

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += (10 - i) * Number(cpf[i]);
        }

        let resto = soma % 11;
        if ((resto <= 1 && digitoJ !== 0) || (resto > 1 && (11 - resto) !== digitoJ)) 
            return false;

        soma += 2 * digitoJ;
        for (let i = 0; i < 9; i++) {
            soma += Number(cpf[i]);
        }

        resto = soma % 11;
        if ((resto <= 1 && digitoK !== 0) || (resto > 1 && (11 - resto) !== digitoK)) 
            return false;

        return true;
    }

};