const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp')
const GlobalOffensive = require('globaloffensive');
const FileSystem = require("fs");
const config = require('./config');

let user = new SteamUser();
let csgo = new GlobalOffensive(user);

function quit() {
  user.gamesPlayed([]);
  user.logOff();
  user.on('disconnected', () => {
    process.exit(1);
  });
};

const logInOptions = {
  accountName: config.accountName,
	password: config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

user.logOn(logInOptions);

user.on('loggedOn', () => {
  user.on('accountInfo', (username) => {
    console.log("Logged into Steam as " + username);
  });
  user.setPersona(SteamUser.EPersonaState.Online);
  user.gamesPlayed([730]);
});

csgo.on('disconnectedFromGC', (reason) => {
    if (reason == GlobalOffensive.GCConnectionStatus.GC_GOING_DOWN) {
        console.log('GC going down');
    }
});

function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function add_to_casket() {
  let inventory = csgo.inventory;
  let currentTime = new Date().getTime();
  let cnt = 0;
  console.log(inventory.length);


  const regex = /(?<=\), )0\.\d+(?=,)/g;
  const purchase_data = FileSystem.readFileSync(config.file_path, 'utf8').trim().split('\n').splice(-500);
  for (var i=0; i<purchase_data.length; i++) purchase_data[i] = parseFloat(purchase_data[i].match(regex)[0]);

  for (const item of inventory)
  {
    if(cnt > 49) break;

    if(currentTime < new Date(item['tradable_after']).getTime() && purchase_data.includes(item['paint_wear']) && !item.hasOwnProperty('casket_id'))
    {
      csgo.addToCasket(config.casket_id, item['id']);
      cnt++;
    }
  }
  console.log(`${inventory.length}, added ${cnt} items to storage units`);
  return cnt;

}

function remove_from_casket() {

  var cnt = 0;

  csgo.getCasketContents(config.casket_id, function(err, items) {
    if (err) throw err;

    let currentTime = new Date().getTime();
    // let cnt = 0;
    console.log(items.length);

    for (const item of items) {

      if(cnt > 49) break;

      if(currentTime > new Date(item['tradable_after']).getTime())
      {
        csgo.removeFromCasket(config.casket_id, item['id']);
        cnt++;
      }
    }
    console.log(`${items.length}, removed ${cnt} items from storage units`);

  });
  return cnt;

}

function do_stuff() {
  let a = add_to_casket();
  let b = remove_from_casket();
  console.log(a+b);
  return a+b;
}

csgo.on('connectedToGC', () => {
  console.log('Connected to GC!');

  if(csgo.haveGCSession) {
    console.log('Have Session!');

    var cnt = 1;
    setInterval(function() {

      cnt = do_stuff();

      if (cnt == 0) {
          quit();
      }
    }, 3000);
  };
});
