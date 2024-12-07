import Database from "../db/Database.js";

import PacienteController from '../controllers/PacienteController.js';
import ConsultaController from "../controllers/ConsultaController.js";

await Database.autenticacao();
await Database.conexao.sync();

console.log(await PacienteController.getPacientesOrdenadosPorCpf());
console.log(await ConsultaController.listarConsultas())

await Database.close();