const characterListEl = document.getElementById("characterList");
let pageCounter = 1;
let url = `https://swapi.dev/api/people/?page=${pageCounter}`;
const detailsListEl = document.getElementById("detailsList");
const detailsListBottomEl = document.getElementById("detailsListBottom");
const nameHeaderEL = document.getElementById("nameHeader");
const planetHeaderEl = document.getElementById("planetHeader");
const paginationCounter = document.getElementById("paginationCounter");
const backPageEl = document.getElementById("backPage");
const nextPageEl = document.getElementById("nextPage");
const paginationCounterEl = document.getElementById("paginationCounter");
const spinner = document.querySelector(".loading");
/*const planetBtnEl = document.getElementById("planetBtn");
const speciesBtnEl = document.getElementById("speciesBtn");
const vehiclesBtnEl = document.getElementById("vehiclesBtn");
const starshipsBtnEl = document.getElementById("starshipsBtn");*/
const detailsInfoBottomNavEL = document.getElementById("detailsInfoBottomNav");
const detailsButtonsEl = document.querySelectorAll(".detailsButtons");
nextPageEl.addEventListener("click", () => {
  //hanterar framåtklick
  if (pageCounter < 9) {
    pageCounter++;
    Array.from(characterListEl.children).forEach((child) => child.remove()); // resetar element
    Array.from([
      ...detailsListEl.children,
      ...detailsListBottomEl.children,
    ]).forEach((child) => child.remove());
    nameHeaderEL.innerText = "";
    planetHeaderEl.innerText = "";
    fetchCharacters(pageCounter); // kör fetch med nya pagenumber som inparameter
  }
});

backPageEl.addEventListener("click", () => {
  // hanterar bakåtklick
  if (pageCounter != 1) {
    pageCounter--;
    Array.from(characterListEl.children).forEach((child) => child.remove());
    Array.from([
      ...detailsListEl.children,
      ...detailsListBottomEl.children,
    ]).forEach((child) => child.remove());
    nameHeaderEL.innerText = "";
    planetHeaderEl.innerText = "";
    fetchCharacters(pageCounter); // kör fetch med nya pagenumber som inparameter
  }
});

const fetchCharacters = async (pageCounter) => {
  let url = `https://swapi.dev/api/people/?page=${pageCounter}`; //den sida vi är på visuellt == den page som ska hämtas
  paginationCounterEl.innerText = pageCounter;
  spinner.hidden = false; //visar spinner
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Errormessege :(");
    }
    let characterList = await response.json();
    characterList = characterList.results;
    console.log(characterList);
    characterList.forEach(async (character) => {
      const response = await fetch(character.homeworld);
      const homeworld = await response.json();
      character.homeworld = homeworld;

      let responseSpecies;
      let species;
      if (character.species[0]) {
        // kollar om det finns värde i key species och i så fall hämtar
        responseSpecies = await fetch(character.species[0]);
        species = await responseSpecies.json();
        character.species = species;
      }
      console.log(character.species);
      if (character.vehicles[0]) {
        const vehicles = await Promise.all(
          // kollar om det finns värde i key vehicles och i så fall hämtar
          character.vehicles.map(async (vehicle) => {
            const responseVehicles = await fetch(vehicle);
            return await responseVehicles.json();
          })
        );
        character.vehicles = vehicles;
      }
      console.log(character.vehicles);

      if (character.starships[0]) {
        const starships = await Promise.all(
          character.starships.map(async (starship) => {
            const responseStarships = await fetch(starship);

            return await responseStarships.json();
          })
        );
        character.starships = starships;
      }
      console.log(character.starships);

      addCharacter(characterList, character);
    });
  } catch (error) {
    console.error("Network Error:", error);
  }
  spinner.hidden = true;
};
let selectedCharacter;
const addCharacter = (characterList, character) => {
  let listEl = document.createElement("li");
  listEl.innerText = character.name;
  characterListEl.appendChild(listEl);
  listEl.addEventListener("click", () => {
    Array.from(characterListEl.children).forEach((child) =>
      child.classList.remove("active")
    ); //resetar activestyling först innan lägger på nytt
    listEl.classList.add("active"); // lägger till activestyling
    console.log(listEl);
    selectedCharacter = character;
    updateDetails(character);
  });
};
fetchCharacters(pageCounter);

//för varje click på details buttons
detailsButtonsEl.forEach((button) => {
  const active = "detailsButtonsActive";
  button.addEventListener("click", (event) => {
    let clickedButton = document.getElementById(event.target.id);
    Array.from(detailsButtonsEl)
      .filter((f) => f !== clickedButton)
      .forEach((button) => button.classList.remove(active));
    clickedButton.classList.add(active);

    console.log(selectedCharacter);
    updateDetails(selectedCharacter, clickedButton.id);
  });
});
const updateDetails = (character, porp) => {
  const excludedKeys = [
    //lista för de key's som inte ska vara med i innertext
    "created",
    "edited",
    "url",
    "homeworld",
    "population",
    "surface_water",
    "name",
    "films",
    "people",
    "pilots",
    "MGLT",
  ];
  Array.from([
    ...detailsListEl.children,
    ...detailsListBottomEl.children,
  ]).forEach((child) => child.remove()); // reseta

  for (const key in character) {
    let value = character[key];
    if (typeof value === "string" && !excludedKeys.includes(key)) {
      let listEl = document.createElement("li");
      listEl.innerText = key.replaceAll("_", " ") + ": " + value;
      detailsListEl.appendChild(listEl);
    }
  }

  for (const key in character.porp ?? character.homeworld) {
    let value = character.porp?.[key] ?? character.homeworld[key];
    if (typeof value === "string" && !excludedKeys.includes(key)) {
      let listEl = document.createElement("li");
      listEl.innerText = key.replaceAll("_", " ") + ": " + value;
      detailsListBottomEl.appendChild(listEl);
    } else if (Array.isArray(character[porp])) {
      Array.from([
        ...detailsListEl.children,
        ...detailsListBottomEl.children,
      ]).forEach((child) => child.remove());
      character[porp].forEach((obj) => {
        console.log(character.porp);
        for (const key in obj) {
          console.log(key);
          if (!excludedKeys.includes(key)) {
            let listEl = document.createElement("li");
            listEl.innerText = key.replaceAll("_", " ") + ": " + obj[key];
            detailsListBottomEl.appendChild(listEl);
          }
        }
      });
    }
  }
  nameHeaderEL.innerText = character.name; // namn placeras på eget el
  planetHeaderEl.innerText = character[porp]?.name ?? character.homeworld.name; // namn placeras på eget el
};

//att göra
// planetheader
//if length in array <0 scrollbar
//
