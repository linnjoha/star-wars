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
const detailsInfoBottomNavEL = document.getElementById("detailsInfoBottomNav");
const detailsButtonsEl = document.querySelectorAll(".detailsButtons");

//hanterar framåtklick
nextPageEl.addEventListener("click", () => {
  //om pagecounter är upp till 9 så ska framåtklick funka
  if (pageCounter < 9) {
    pageCounter++;
    // resetar element på character
    Array.from(characterListEl.children).forEach((child) => child.remove());
    Array.from([
      ...detailsListEl.children,
      ...detailsListBottomEl.children,
    ]).forEach((child) => child.remove());
    nameHeaderEL.innerText = "";
    planetHeaderEl.innerText = "";
    // kör fetch med nya pagenumber som inparameter
    fetchCharacters(pageCounter);
  }
});

// hanterar bakåtklick
backPageEl.addEventListener("click", () => {
  //om pagecounter inte är 1 så ska bakåtklick funka
  if (pageCounter != 1) {
    pageCounter--;
    Array.from(characterListEl.children).forEach((child) => child.remove());
    Array.from([
      ...detailsListEl.children,
      ...detailsListBottomEl.children,
    ]).forEach((child) => child.remove());
    nameHeaderEL.innerText = "";
    planetHeaderEl.innerText = "";
    // kör fetch med nya pagenumber som inparameter
    fetchCharacters(pageCounter);
  }
});

//hämtar characters och deras species, vehicles och starships
//den sida vi är på visuellt == den page som ska hämtas
const fetchCharacters = async (pageCounter) => {
  let url = `https://swapi.dev/api/people/?page=${pageCounter}`;
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

      //fetch allt i key species
      let responseSpecies;
      let species;
      if (character.species[0]) {
        // kollar om det finns värde i key species och i så fall hämtar
        responseSpecies = await fetch(character.species[0]);
        species = await responseSpecies.json();
        character.species = species;
      }
      // console.log(character.species);

      // kollar om det finns värde i key vehicles och i så fall hämtar
      if (character.vehicles[0]) {
        const vehicles = await Promise.all(
          character.vehicles.map(async (vehicle) => {
            const responseVehicles = await fetch(vehicle);
            return await responseVehicles.json();
          })
        );
        character.vehicles = vehicles;
      }
      //console.log(character.vehicles);

      // kollar om det finns värde i key starships och i så fall hämtar
      if (character.starships[0]) {
        const starships = await Promise.all(
          character.starships.map(async (starship) => {
            const responseStarships = await fetch(starship);

            return await responseStarships.json();
          })
        );
        character.starships = starships;
      }
      //console.log(character.starships);
      addCharacter(character);
    });
  } catch (error) {
    console.error("Network Error:", error);
  }
  //döljer spinner
  spinner.hidden = true;
};

let selectedCharacter;
const addCharacter = (character) => {
  let listEl = document.createElement("li");
  listEl.innerText = character.name;
  characterListEl.appendChild(listEl);
  listEl.addEventListener("click", () => {
    //resetar activestyling först innan lägger på nytt
    Array.from(characterListEl.children).forEach((child) =>
      child.classList.remove("active")
    );
    listEl.classList.add("active");
    selectedCharacter = character;
    // tar bort activestyling om vi väljer en ny character
    detailsButtonsEl.forEach((button) => {
      button.classList.remove("detailsButtonsActive");
    });
    updateDetails(character);
  });
};
//programstart//
fetchCharacters(pageCounter);

//lägger till eventlisteners på alla knappar i classlist med knappar
detailsButtonsEl.forEach((button) => {
  const active = "detailsButtonsActive";
  button.addEventListener("click", (event) => {
    //för varje knapp i listan av knappar ger vi deras id
    let clickedButton = document.getElementById(event.target.id);
    //filtrerar ut om någon knapp har active och då remove, sedan lägger till styling active
    Array.from(detailsButtonsEl)
      .filter((f) => f !== clickedButton)
      .forEach((button) => button.classList.remove(active));
    clickedButton.classList.add(active);

    //skickar med character som här är selectedcharacter, samt knappen som blivit klickad på.
    updateDetails(selectedCharacter, clickedButton.id);
  });
});

//När men klickar på character hamnar man i denna funktion som uppdaterar informationen dom på details
const updateDetails = (character, porp) => {
  //lista för de key's som inte ska vara med i innertext
  const excludedKeys = [
    "created",
    "edited",
    "url",
    "population",
    "surface_water",
    "name",
    "films",
    "people",
    "pilots",
    "MGLT",
  ];
  // reseta listel
  Array.from([
    ...detailsListEl.children,
    ...detailsListBottomEl.children,
  ]).forEach((child) => child.remove());

  //uppdaterar informationen om character för varje keyvalue i objektet character
  for (const key in character) {
    let value = character[key];
    if (typeof value === "string" && !excludedKeys.includes(key)) {
      let listEl = document.createElement("li");
      listEl.innerText = key.replaceAll("_", " ") + ": " + value;
      detailsListEl.appendChild(listEl);
    }
  }

  //uppdaterar på planet, species, vehicles, starships.
  let name = "";

  //använder details knappens id för att komma åt det vi vill i character
  for (const key in character[porp]) {
    let value = character[porp]?.[key];
    if (typeof value === "string" && !excludedKeys.includes(key)) {
      name = character[porp]?.name;
      let listEl = document.createElement("li");
      listEl.innerText = key.replaceAll("_", " ") + ": " + value;
      detailsListBottomEl.appendChild(listEl);
    } else if (Array.isArray(character[porp])) {
      character[porp].forEach((obj) => {
        console.log(character.porp);
        for (const key in obj) {
          console.log(key);
          if (!excludedKeys.includes(key)) {
            let listEl = document.createElement("li");
            listEl.innerText = key.replaceAll("_", " ") + ": " + obj[key];
            detailsListBottomEl.appendChild(listEl);
          } else if (key == "name") {
            let nameHeader = document.createElement("p");
            nameHeader.innerText = obj[key];
            nameHeader.id = "planetHeader";
            detailsListBottomEl.appendChild(nameHeader);
          }
        }
      });
    }
  }
  planetHeaderEl.innerText = name; // namn placeras på eget el
  nameHeaderEL.innerText = character.name; // namn placeras på eget el
};
