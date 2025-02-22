import { AVAILABLE_CHARACTERS  } from "./constants/available-characters.js" 
import { REQUIRED_SKILL } from "./constants/required-skill.js"
import { PLAYER } from "./constants/player-index.constant.js"
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

    return (function () {
        switch (true) {
            case random < 0.33:
                return "RETA";
            case random < 0.66:
                return "CURVA";
            default:
                return "CONFRONTO";
        }
    }());
}

async function logRollResult(characters, requiredSkill, diceResults) {
    characters.forEach((character, index) => {        
        console.log(
            `${character.NOME} 🎲 rolou um dado de ${requiredSkill} ${diceResults[index]} + ${character[requiredSkill]} = ${
                diceResults[index] + character[requiredSkill]
            }`
        );
    });
}

async function playRaceEngine(characters) {
    for (let round = 1; round <= 5; round++) {
        console.log(`🏁 Rodada ${round}`);

        // sortear bloco
        let sortedBlock = await getRandomBlock();
        console.log(`Bloco: ${sortedBlock}`);

        let isFightBlock = sortedBlock == "CONFRONTO";

        // rolar os dados
        let diceResults = [ await rollDice(), await rollDice() ];

        //teste de habilidade
        let totalTestSkills = diceResults.map((value, index) => value + characters[index][REQUIRED_SKILL[sortedBlock]]);

        if (isFightBlock) console.log(`${characters[PLAYER.ONE].NOME} confrontou ${characters[PLAYER.TWO].NOME}! 🥊`);

        await logRollResult(characters, REQUIRED_SKILL[sortedBlock], diceResults);

        const roundWinner = await declareRoundWinner(characters, totalTestSkills, isFightBlock);

        characters = await updatePoints(characters, roundWinner, isFightBlock);

        console.log("-----------------------------");
        await timeout(2000);
    } 

    return characters
}

async function updatePoints(characters, roundWinner, isFightBlock) {
    if(!isFightBlock && roundWinner != PLAYER.NONE) characters[roundWinner].PONTOS++;
    else if (isFightBlock) {
        if (roundWinner == PLAYER.ONE && characters[PLAYER.TWO].PONTOS > 0) {
            characters[PLAYER.TWO].PONTOS--;
        } else if (roundWinner == PLAYER.TWO && characters[PLAYER.ONE].PONTOS > 0) {
            characters[PLAYER.ONE].PONTOS--;
        }
    }
    return characters;
}

async function declareRoundWinner(characters, totalTestSkills, isFightBlock) {
    const points = totalTestSkills[PLAYER.ONE] - totalTestSkills[PLAYER.TWO];
    const winner = points == 0 ? PLAYER.NONE : points > 0 ? PLAYER.ONE : PLAYER.TWO;
    const noTieMessage = `${characters[winner]?.NOME} ${ isFightBlock ? "venceu o confronto": "marcou um ponto!" }`;
    
    let message = points == 0 ? "Houve um empate, ninguém ganha pontos." : noTieMessage;
    if(points != 0 && isFightBlock){
        message += characters[1 - winner].PONTOS > 0 ? 
                `! ${characters[1 - winner].NOME} perdeu 1 ponto 🐢` : 
                `, mas ${characters[1 - winner].NOME} não tem pontos para perder.`
    }
    console.log(message);
    return winner
} 

async function declareFinalWinner(players) {
    console.log("Resultado final:");
    players.forEach(player => console.log(`${player.NOME}: ${player.PONTOS} ponto(s)`))

    const points = players[PLAYER.ONE].PONTOS - players[PLAYER.TWO].PONTOS;
    console.log(points == 0 ? "\nA corrida terminou em empate" : `\n${ points > 0 ? players[PLAYER.ONE].NOME : players[PLAYER.TWO].NOME } venceu a corrida! Parabéns! 🏆`);
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
    let players = [ await chooseCharacter(AVAILABLE_CHARACTERS) ]
    players.push(await chooseCharacter(AVAILABLE_CHARACTERS.filter(x => x != players[PLAYER.ONE])))
    rl.close();
    
    console.log(`🏁🚨 Corrida entre ${players[PLAYER.ONE].NOME} e ${players[PLAYER.TWO].NOME} começando...\n`);
    await timeout(2000);

    players = await playRaceEngine(players);

    await declareFinalWinner(players);
})();