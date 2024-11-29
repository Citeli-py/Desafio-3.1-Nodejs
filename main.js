import { Menu } from './views/Menu.js';
import { CadastroPacientes } from './views/CadastroPacientes.js';
import { Agendamento } from './views/Agendamento.js';

import { PacienteController } from './controllers/PacienteController.js';
import { ConsultaController } from './controllers/ConsultaController.js';


const consulta_controller = new ConsultaController();
const pacientes_controller = new PacienteController();

const Telas = { "Menu":               new Menu(),
                "CadastroPacientes":  new CadastroPacientes(pacientes_controller, consulta_controller),
                "Agendamento":        new Agendamento(pacientes_controller, consulta_controller),
                "Fim":                false
            };

var tela_atual = Telas.Menu;

while(tela_atual){
    let proxima_tela= tela_atual.main()
    tela_atual = Telas[proxima_tela];
}