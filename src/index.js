import { availableCharacters } from "./constants/available-characters.js" 
import { blockSkill } from "./constants/block-skill.js"
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

async function getRandomBlock() {
    let random = Math.random();

    let result = function () {
        switch (true) {
            case random < 0.33:
                return "RETA";
            case random < 0.66:
                return "CURVA";
            default:
                return "CONFRONTO";
        }
    };

    return result();
}

async function logRollResult(characters, blockSkill, diceResults) {
    characters.forEach((character, index) => {        
        console.log(
            `${character.NOME} 🎲 rolou um dado de ${blockSkill} ${diceResults[index]} + ${character[blockSkill]} = ${
            diceResults[index] + character[blockSkill]
            }`
        );
    });
}

async function playRaceEngine(characters) {
    for (let round = 1; round <= 5; round++) {
        console.log(`🏁 Rodada ${round}`);

        // sortear bloco
        let block = await getRandomBlock();
        console.log(`Bloco: ${block}`);

        // rolar os dados
        let diceResults = [ await rollDice(), await rollDice() ]

        //teste de habilidade
        let totalTestSkills = [0,0];
        totalTestSkills[0] = diceResults[0] + characters[0][blockSkill[block]];
        totalTestSkills[1] = diceResults[1] + characters[1][blockSkill[block]];

        if (block == "CONFRONTO") console.log(`${characters[0].NOME} confrontou ${characters[1].NOME}! 🥊`);

        await logRollResult(characters, blockSkill[block], diceResults);

        const winner = await declareRoundWinner(characters, totalTestSkills, block == "CONFRONTO");

        switch(block){
            case "RETA":
            case "CURVA":
                if (winner != null) characters[winner].PONTOS++;
                break;
            default:        
                if (winner == 0 && characters[1].PONTOS > 0) {;
                    characters[1].PONTOS--;
                } else if (winner == 1 && characters[0].PONTOS > 0) {
                    characters[0].PONTOS--;
                }
        }

        console.log("-----------------------------");
        await timeout(2000);
    }

    return characters
}

async function declareRoundWinner(characters, totalTestSkills, isFightBlock) {
    if (totalTestSkills[0] > totalTestSkills[1]) {
        console.log( isFightBlock ?
            `${characters[0].NOME} venceu o confronto${characters[1].PONTOS > 0 ? `! ${characters[1].NOME} perdeu 1 ponto 🐢` : `, mas ${characters[1].NOME} não tem pontos para perder.`}` :
            `${characters[0].NOME} marcou um ponto!`
        );
        return 0;
    } else if (totalTestSkills[1] > totalTestSkills[0]) {
        console.log( isFightBlock ?
            `${characters[1].NOME} venceu o confronto${characters[0].PONTOS > 0 ? `! ${characters[0].NOME} perdeu 1 ponto 🐢` : `, mas ${characters[0].NOME} não tem pontos para perder.`}` :
            `${characters[1].NOME} marcou um ponto!`
        );
        return 1;
    } else {
        console.log("Houve um empate, ninguém ganha pontos.");
        return null
    }
}

async function declareFinalWinner(players) {
    console.log("Resultado final:");
    console.log(`${players[0].NOME}: ${players[0].PONTOS} ponto(s)`);
    console.log(`${players[1].NOME}: ${players[1].PONTOS} ponto(s)`);

    if (players[0].PONTOS > players[1].PONTOS)
        console.log(`\n${players[0].NOME} venceu a corrida! Parabéns! 🏆`);
    else if (players[1].PONTOS > players[0].PONTOS)
        console.log(`\n${players[1].NOME} venceu a corrida! Parabéns! 🏆`);
    else console.log("A corrida terminou em empate");
}

async function chooseCharacter(availableCharacters){
    console.log("Personagens disponíveis:");
    for(let i = 0; i < availableCharacters.length; i++){ 
        console.log(`${availableCharacters[i].INDEX} - ${availableCharacters[i].NOME}`)       
    }

    const index = await new Promise((resolve) => {
        rl.question('Digite o número do seu personagem: ', (character) => {
          resolve(character);
        });
    });
    console.log(`Personagem escolhido: ${availableCharacters.find(x => x.INDEX == index).NOME}`);
    console.log("-----------------------------");
    return availableCharacters.find(x => x.INDEX == index);
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function main() {
    console.log("---------------- MARIO KART RACE ----------------");
    console.log('Escolha dois personagens para participar:')
    let players = [ await chooseCharacter(availableCharacters) ]
    players.push(await chooseCharacter(availableCharacters.filter(x => x != players[0])))
    rl.close();
    
    console.log(`🏁🚨 Corrida entre ${players[0].NOME} e ${players[1].NOME} começando...\n`);
    await timeout(2000);

    players = await playRaceEngine(players);

    await declareFinalWinner(players);
})();