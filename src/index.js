import { AVAILABLE_CHARACTERS  } from "./constants/available-characters.js" 
import { BLOCK_SKILL } from "./constants/block-skill.js"
import { PLAYER } from "./constants/player.constant.js"
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

        let isFightBlock = block == "CONFRONTO";

        // rolar os dados
        let diceResults = [ await rollDice(), await rollDice() ];

        //teste de habilidade
        let totalTestSkills = [0,0];
        totalTestSkills[PLAYER.ONE] = diceResults[PLAYER.ONE] + characters[PLAYER.ONE][BLOCK_SKILL[block]];
        totalTestSkills[PLAYER.TWO] = diceResults[PLAYER.TWO] + characters[PLAYER.TWO][BLOCK_SKILL[block]];

        if (isFightBlock) console.log(`${characters[PLAYER.ONE].NOME} confrontou ${characters[PLAYER.TWO].NOME}! 🥊`);

        await logRollResult(characters, BLOCK_SKILL[block], diceResults);

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
    if (totalTestSkills[PLAYER.ONE] > totalTestSkills[PLAYER.TWO]) {
        console.log( isFightBlock ?
            `${characters[PLAYER.ONE].NOME} venceu o confronto${characters[PLAYER.TWO].PONTOS > 0 ? `! ${characters[1].NOME} perdeu 1 ponto 🐢` : `, mas ${characters[PLAYER.TWO].NOME} não tem pontos para perder.`}` :
            `${characters[PLAYER.ONE].NOME} marcou um ponto!`
        );
        return PLAYER.ONE;
    } else if (totalTestSkills[PLAYER.TWO] > totalTestSkills[PLAYER.ONE]) {
        console.log( isFightBlock ?
            `${characters[PLAYER.TWO].NOME} venceu o confronto${characters[PLAYER.ONE].PONTOS > 0 ? `! ${characters[PLAYER.ONE].NOME} perdeu 1 ponto 🐢` : `, mas ${characters[PLAYER.ONE].NOME} não tem pontos para perder.`}` :
            `${characters[PLAYER.TWO].NOME} marcou um ponto!`
        );
        return PLAYER.TWO;
    } else {
        console.log("Houve um empate, ninguém ganha pontos.");
        return PLAYER.NONE
    }
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