import WalletController from "./utils/WalletController";
import Game from "./game/game";

const walletController = new WalletController();
const game = new Game();

let flagBalance = 0;

let currentModelIndex = 1
let currentModelLevel = 4

window.addEventListener('resize', () => {
    game.resize();
});

window.addEventListener('keydown', (event) => {
  game.keyDownHandle(event.key);
  updateFlagBalance();
});

window.addEventListener('keyup', (event) => {
  game.keyUpHandle(event.key);
});

function updateFlagBalance() {
  // Create a promise to update flagBalance
  walletController.getTokenBalance().then((balance) => {
    flagBalance = Math.floor(balance);
  });
}

const connectButton = document.getElementById('connectButton');
connectButton.onclick = async () => {
  if(!walletController.walletConnected){
    await walletController.connectWallet();
    if(walletController.walletConnected){
      // Hide the button
      connectButton.disabled = true;
      connectButton.innerText = 'Wallet Connected'

      convertButton.disabled = false;
      updateFlagBalance();
    }
  }
};

const convertButton = document.getElementById('convertButton');
convertButton.disabled = true;
convertButton.onclick = async () => {
  if(walletController.walletConnected){
    await walletController.convertScoreToToken(game.getScore());
    game.resetScore();
    updateFlagBalance();
  }
};

const scoreElement = document.getElementById('score');
const flagElement = document.getElementById('flags')

const controlsTutorial = document.getElementById('controlsTutorial');
const walletTutorial = document.getElementById('walletTutorial');
const convertTutorial = document.getElementById('convertTutorial');

let timer = 0;
function loop() {
  requestAnimationFrame(loop);

  if(walletController.walletConnected) {
    walletTutorial.style.display = 'none';
    convertButton.disabled = false;
    flagElement.innerHTML = '<code>$FLAG</code>: ' + flagBalance;
  }

  let score = game.getScore();
  if(score > 2 || flagBalance > 0) {
    controlsTutorial.style.display = 'none';
  }

  if(score > 10 && flagBalance <= 0) {
    convertTutorial.style.display = 'block';
  }

  // console.log(score + flagBalance, currentModelLevel, currentModelIndex)
  if(score + flagBalance > currentModelLevel) {
    game.loadNewVehicleModel(currentModelIndex);
    currentModelIndex++;
    currentModelLevel = 4 * currentModelIndex;
    score++;
  }

  scoreElement.innerHTML = '<code>SCORE</code>: ' + score;

  game.animate();
  timer++;
}

loop();