import Database from "./Database.js";
import ConsultaController from "../controllers/ConsultaController.js";
import PacienteController from "../controllers/PacienteController.js";

await Database.autenticacao();
await Database.conexao.sync({ force: true });

// Criação dos pacientes
PacienteController.iniciarNovoPaciente();
await PacienteController.setCpf("57219947038");
PacienteController.setNome("Matheus");
PacienteController.setData_nasc("30/12/2001");
console.log(await PacienteController.addPaciente());

PacienteController.iniciarNovoPaciente();
await PacienteController.setCpf("71089185014");
PacienteController.setNome("Jucaa");
PacienteController.setData_nasc("22/09/1999");
console.log(await PacienteController.addPaciente());

PacienteController.iniciarNovoPaciente();
await PacienteController.setCpf("19086839703");
PacienteController.setNome("Cicii");
PacienteController.setData_nasc("22/09/1999");
console.log(await PacienteController.addPaciente());

ConsultaController.iniciarNovaConsulta();
await ConsultaController.setCpf("71089185014");
ConsultaController.setDataConsulta("06/12/2024")
ConsultaController.setHoraInicial("0900");
ConsultaController.setHoraFinal("0930");
console.log(await ConsultaController.addConsulta());

ConsultaController.iniciarNovaConsulta();
await ConsultaController.setCpf("57219947038");
console.log(ConsultaController.setDataConsulta("10/12/2024"))
console.log(ConsultaController.setHoraInicial("0930"));
console.log(ConsultaController.setHoraFinal("1045"));
console.log(await ConsultaController.addConsulta());

ConsultaController.iniciarNovaConsulta();
await ConsultaController.setCpf("19086839703");
console.log(ConsultaController.setDataConsulta("06/12/2024"))
console.log(ConsultaController.setHoraInicial("1100"));
console.log(ConsultaController.setHoraFinal("1200"));
console.log(await ConsultaController.addConsulta());

await Database.close();
