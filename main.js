import { Menu } from './views/Menu.js';
import { CadastroPacientes } from './views/CadastroPacientes.js';
import { Agendamento } from './views/Agendamento.js';

import Database from './db/Database.js';

async function main(){

    
    const Telas = { 
        "Menu":               new Menu(),
        "CadastroPacientes":  new CadastroPacientes(),
        "Agendamento":        new Agendamento(),
        "Fim":                false
    };
    
    if(!(await Telas.Menu.autenticar()))
        return;

    await Database.conexao.sync({ force: false });

    var tela_atual = Telas.Menu;

    while(tela_atual){
        let proxima_tela= await tela_atual.main()
        tela_atual = Telas[proxima_tela];
    }

    await Database.close();
}

await main();