import { Menu } from './views/Menu.js';
import { CadastroPacientes } from './views/CadastroPacientes.js';
import { Agendamento } from './views/Agendamento.js';

import Database from './db/Database.js';
import { ErrorCodes } from './utils/Error.js';

const isAutenticado = await Database.autenticacao();
if(!isAutenticado.sucess){
    switch (isAutenticado.error) {
        case ErrorCodes.ERR_BD_DESCONHECIDO:
            console.log("Erro: Ocorreu um erro desconhecido ao se conectar com o banco de dados");
            break;
    
        case ErrorCodes.ERR_BD_HOST_INVALIDO:
            console.log("Erro: Host inválido, verifique o .env e as credenciais do seu banco de dados");
            break;

        case ErrorCodes.ERR_BD_LOGIN_INVALIDO:
            console.log("Erro: Login inválido, verifique o .env e as credenciais do seu banco de dados");
            break;

        case ErrorCodes.ERR_BD_INEXISTENTE:
            console.log("Erro: Nome do Banco de dados inválido, verifique o .env e as credenciais do seu banco de dados");
            break;
    }
} else {

    await Database.conexao.sync({ force: false });

    const Telas = { 
        "Menu":               new Menu(),
        "CadastroPacientes":  new CadastroPacientes(),
        "Agendamento":        new Agendamento(),
        "Fim":                false
    };

    var tela_atual = Telas.Menu;

    while(tela_atual){
        let proxima_tela= await tela_atual.main()
        tela_atual = Telas[proxima_tela];
    }
}

await Database.close();