// ==UserScript==
// @name         CryptopiaAutoGame
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Draco9
// @match        https://desertopia2.gamtropy.com/
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const tileids = [];
  const animalids = [];
  const authaccount = "INPUT_YOU_AUTH_ACCOUNT";
  const seedReward = "5";

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchData(url, data) {
    return fetch(url, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site"
      },
      referrer: "https://desertopia2.gamtropy.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "omit"
    });
  }

  async function getPlayerTileFromServer() {
    const url = "https://us-central1-cryptopia-14595.cloudfunctions.net/getPlayerTileFromServer";
    const data = { data: { authaccount: authaccount } };
    const response = await fetchData(url, data);
    const jsonResponse = await response.json(); // Parse the JSON response
    return jsonResponse.result;
  }

  async function getPlayerAnimalFromServer() {
    const url = "https://us-central1-cryptopia-14595.cloudfunctions.net/getPlayerAnimalFromServer";
    const data = { data: { authaccount: authaccount } };
    const response = await fetchData(url, data);
    const jsonResponse = await response.json(); // Parse the JSON response
    return jsonResponse.result;
  }

  async function performGetPlayerTileFromServer() {
    const playerTileData = await getPlayerTileFromServer(); // Get the player's tile data
    const jsonResponse = JSON.parse(playerTileData); // Parse the JSON string

    if (jsonResponse.resultcode === 1) {
      const playerTiles = jsonResponse.data.playertile;

      if (playerTiles && playerTiles.length > 0) {
        playerTiles.forEach((tile) => {
          tileids.push(tile.id.toString()); // Add each tile's ID to the tileids array
        });
      }
    } else {
      console.error("Failed to retrieve player's tile data.");
    }
  }

  async function performGetPlayerAnimalFromServer() {
    const playerAnimalData = await getPlayerAnimalFromServer(); // Get the player's animal data
    const jsonResponse = JSON.parse(playerAnimalData); // Parse the JSON string

    if (jsonResponse.resultcode === 1) {
      const playerAnimal = jsonResponse.data.playeranimal;

      if (playerAnimal && playerAnimal.length > 0) {
        playerAnimal.forEach((animal) => {
          animalids.push(animal.id.toString()); // Add each animal's ID to the animalids array
        });
      }
    } else {
      console.error("Failed to retrieve player's animal data.");
    }
  }

  async function getGameboyReward(amount) {
    const url = "https://us-central1-cryptopia-14595.cloudfunctions.net/getGameboyRewardFromServer";
    const data = { data: { rewardseed: amount, authaccount: authaccount } };
    await fetchData(url, data);
    await delay(800);
  }

  async function collectFood(tileids) {
    const url = "https://us-central1-cryptopia-14595.cloudfunctions.net/collectFoodFromServer";

    for (const tileid of tileids) {
      const data = { data: { tileid, authaccount } };
      await fetchData(url, data);
      await delay(800);
    }
  }

  async function setTileProduceFromServer(tileids) {
    const url = "https://us-central1-cryptopia-14595.cloudfunctions.net/setTileProduceFromServer";

    for (const tileid of tileids) {
      const data = { data: { tileid, authaccount } };
      await fetchData(url, data);
      await delay(1200);
    }
  }

  async function setAnimalProduceFromServer(animalids) {
    const url = "https://us-central1-cryptopia-14595.cloudfunctions.net/setAnimalProduceFromServer";

    for (const animalid of animalids) {
      const data = { data: { animalid, authaccount } };
      await fetchData(url, data);
      await delay(1000);
    }
  }

  async function collectAmberFromServer(animalids) {
    const url = "https://us-central1-cryptopia-14595.cloudfunctions.net/collectAmberFromServer";

    for (const animalid of animalids) {
      const data = { data: { animalid, authaccount } };
      await fetchData(url, data);
      await delay(1000);
    }
  }

  async function performTasks() {
    await getGameboyReward(seedReward);
    await collectFood(tileids);
    await setTileProduceFromServer(tileids);
  }

  async function performAdditionalTasks() {
    await Promise.all([
      collectAmberFromServer(animalids),
      setAnimalProduceFromServer(animalids)
    ]);
  }
  async function task() {
    console.log("[auto script]run task");
    if (tileids.length == 0) {
      await performGetPlayerTileFromServer();
      console.log("[auto script] tileids:", tileids);
    }
    if (animalids.length == 0) {
      await performGetPlayerAnimalFromServer();
      console.log("[auto script] animalids:", animalids);
    }
    await performTasks();
    await performAdditionalTasks();
    console.log("[auto script]finish task");
  }


  // 使用 setInterval 设置定时循环执行
  var intervalId = setInterval(task, 1000 * 120);
  console.log("[auto script]loaded.");
})();
