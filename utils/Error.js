/**
 * Conjunto de erros da aplicação
 */
export const ErrorCodes = {
    // Erros relacionados ao paciente
    /** O CPF informado não está no formato válido.*/
    ERR_CPF_INVALIDO:               100,

    /** O CPF já está cadastrado no sistema. */
    ERR_CPF_DUPLICADO:              101,

    /** O nome informado possui menos de 5 caracteres. */ 
    ERR_NOME_INVALIDO:              102,

    /** A data de nascimento do paciente é inválida ou está fora do formato esperado. */
    ERR_DATA_PACIENTE_INVALIDA:     103,

    /** O paciente não possui idade mínima para o cadastro (13 anos). */
    ERR_IDADE_INSUFICIENTE:         104, 

    /** Tentativa de agendar consulta para um paciente não cadastrado. */
    ERR_PACIENTE_NAO_CADASTRADO:    105,

    /** O paciente já possui uma consulta marcada, por isso não pode ser excluido. */
    ERR_PACIENTE_AGENDADO:          106, 

    /** Dados obrigatórios do paciente estão ausentes ou incompletos. */
    ERR_PACIENTE_INCOMPLETO:        107, 

    // Erros relacionados à consulta

    /** A data informada para a consulta é inválida ou está fora do formato esperado.*/
    ERR_DATA_CONSULTA_INVALIDA:     200,

    /** A data informada para a consulta é anterior à data atual.*/
    ERR_DATA_CONSULTA_ANTERIOR:     201, 

    /** Tentativa de marcar consulta no mesmo dia, mas fora do horário permitido.*/
    ERR_DATA_CONSULTA_HOJE_FECHADO: 202, 

    /** A hora informada não está no formato válido.*/
    ERR_HORA_INVALIDA:              203,

    /** O horário informado está fora do intervalo de funcionamento permitido.*/
    ERR_HORA_HORARIO_INVALIDO:      204,

    /** A hora final da consulta é anterior ou igual à hora inicial. */
    ERR_HORA_FINAL_ANTES_INICIAL:   205,

    /** O horário informado já passou e não é mais possível agendar. */
    ERR_HORA_PASSADA:               206,

    /** Tentativa de agendar consulta em horário fora do expediente.*/
    ERR_HORA_HORARIO_FECHADO:       207,

    /** Tentativa de definir horário sem antes definir a data da consulta. */
    ERR_HORA_SEM_DATA_CONSULTA:     208,

    /** Tentativa de definir a hora final sem antes definir a hora inicial. */
    ERR_HORA_SEM_HORA_INICIAL:      209,

    /** Dados obrigatórios para criação da consulta estão ausentes ou incompletos. */
    ERR_CONSULTA_INCOMPLETA:        210,
    
    /**Consulta especificada não foi encontrada no sistema. */
    ERR_CONSULTA_NAO_ENCONTRADA:    211, 

    /**Não é possivel agendar duas consultas no mesmo horario */
    ERR_CONSULTA_SOBREPOSTA:        212,

    /**Não é possivel ter mais de uma consulta futura atrelada a um paciente */
    ERR_CONSULTA_DUPLA:      213,

    // Erros gerais ou específicos adicionais
    /** A data final fornecida é menor que a data inicial.*/
    ERR_DATA_FINAL_MENOR_INICIAL:   300,

    /**Entrada inválida ou fora do formato esperado ao manipular a agenda. */
    ERR_ENTRADA_INVALIDA_AGENDA:    301 
};
