//funktion, hämta och placera ut name
// add eventlistener som aktiverar namn och visar mer info på details
//pagination
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
nextPageEl.addEventListener("click", () => {
  if (pageCounter < 9) {
    pageCounter++;
    Array.from(characterListEl.children).forEach((child) => child.remove());
    Array.from([
      ...detailsListEl.children,
      ...detailsListBottomEl.children,
    ]).forEach((child) => child.remove());
    nameHeaderEL.innerText = "";
    planetHeaderEl.innerText = "";
    fetchCharacters(pageCounter);
  }
});

backPageEl.addEventListener("click", () => {
  if (pageCounter != 1) {
    pageCounter--;
    Array.from(characterListEl.children).forEach((child) => child.remove());
    Array.from([
      ...detailsListEl.children,
      ...detailsListBottomEl.children,
    ]).forEach((child) => child.remove());
    nameHeaderEL.innerText = "";
    planetHeaderEl.innerText = "";
    fetchCharacters(pageCounter);
  }
});

const fetchCharacters = async (pageCounter) => {
  let url = `https://swapi.dev/api/people/?page=${pageCounter}`; //den sida vi är på visuellt == den page som ska hämtas
  paginationCounterEl.innerText = pageCounter;
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
      console.log(homeworld);
      addCharacter(characterList, character);
    });
  } catch (error) {
    console.error("Network Error:", error);
  }
};
fetchCharacters(pageCounter);

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
    updateDetails(character);
  });
};

const updateDetails = (character) => {
  const excludedKeys = [
    //lista för de key's som inte ska vara med i innertext
    "created",
    "edited",
    "url",
    "homeworld",
    "population",
    "surface_water",
    "name",
  ];
  Array.from([
    ...detailsListEl.children,
    ...detailsListBottomEl.children,
  ]).forEach((child) => child.remove()); // reseta

  for (const key in character) {
    let value = character[key];
    if (typeof value === "string" && !excludedKeys.includes(key)) {
      let listEl = document.createElement("li");
      listEl.innerText = key + ": " + value;
      detailsListEl.appendChild(listEl);
    }
  }
  for (const key in character.homeworld) {
    let value = character.homeworld[key];
    if (typeof value === "string" && !excludedKeys.includes(key)) {
      let listEl = document.createElement("li");
      listEl.innerText = key + ": " + value;
      detailsListBottomEl.appendChild(listEl);
    }
  }
  nameHeaderEL.innerText = character.name; // namn placeras på eget el
  planetHeaderEl.innerText = character.homeworld.name; // namn placeras på eget el
};

// att göra
//active name när man klickar
