import WalletController from "./utils/WalletController";
import Game from "./game/game";

const walletController = new WalletController();
const game = new Game();

window.addEventListener('resize', () => {
    game.resize();
});

window.addEventListener('keydown', (event) => {
  game.keyDownHandle(event.key);
});

window.addEventListener('keyup', (event) => {
  game.keyUpHandle(event.key);
});

const button = document.getElementById('connectButton');
button.onclick = async () => {
  console.log('wow! you clicked me!')
  if(!walletController.walletConnected){
    await walletController.connectWallet();
    if(walletController.walletConnected){
      // Hide the button
      button.style.display = 'none';
    }
  }
};

function loop() {
  requestAnimationFrame(loop);
  
  game.animate();
}

loop();