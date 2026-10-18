
let houses = JSON.parse(localStorage.getItem("houses")) || []
houses = houses.map(function(house) 
{
    if (typeof house === "string") 
    {
        return {
            address: house,
            visited: false
        };
    }

    return house;
});

async function addHouse()
{
    let input = document.getElementById("houseAddress");
    let address = input.value.trim();

    if (address === "")
    {
        alert("Please enter a house address!");
        return;
    }

    // Find the address in Pullman, WA
    let location = await findAddress(address);

    if (location === null)
    {
        alert("Could not find this address in Pullman, WA.");
        return;
    }

    // Add the house with its coordinates
    houses.push({
        address: address,
        visited: false,
        lat: location.lat,
        lng: location.lng
    });

    input.value = "";

    saveHouses();
    displayHouses();
}




function displayHouses() {
    let list = document.getElementById("houseList");
    list.innerHTML = "";

    houses.forEach(function(house, index) {
        let item = document.createElement("li");

        // Create checkbox
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = house.visited;

        checkbox.onchange = function() {
            house.visited = checkbox.checked;
            saveHouses();
            displayHouses();
        };

        // Display house address
        let text = document.createElement("span");
        text.textContent = (index + 1) + ". " + house.address;

        if (house.visited) {
            text.style.textDecoration = "line-through";
            text.style.opacity = "0.5";
        }

        // Up button
        let upButton = document.createElement("button");
        upButton.textContent = "Up";

        upButton.onclick = function() {
            moveHouse(index, -1);
        };

        // Down button
        let downButton = document.createElement("button");
        downButton.textContent = "Down";

        downButton.onclick = function() {
            moveHouse(index, 1);
        };

        // Delete button
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.onclick = function() {
            deleteHouse(index);
        };

        item.appendChild(checkbox);
        item.appendChild(text);
        item.appendChild(upButton);
        item.appendChild(downButton);
        item.appendChild(deleteButton);

        list.appendChild(item);

    });

    updateProgress();
    updateHouseMarkers();
}



function deleteHouse(index) 
{
    houses.splice(index, 1);
    saveHouses();
    displayHouses();
}


function moveHouse(index, direction) 
{
    let newIndex = index + direction;
    // Prevent moving beyond the list
    if (newIndex < 0 || newIndex >= houses.length)
    {
        return;
    }

    // Swap the two houses
    let temp = houses[index];
    houses[index] = houses[newIndex];
    houses[newIndex] = temp;

    // Update the displayed list
    saveHouses();
    displayHouses();
}




function openRoute() 
{
    let start = document.getElementById("startAddress").value.trim(); 
    let addresses = houses.filter(function(house)
    {
      return !house.visited;
    }).map(function(house)
    {
        return house.address;
    })

    if (start === "" || addresses.length === 0)
    {
        alert("Enter a starting adress and at least one unvisited house!");
        return;
    }

    let destination = addresses[addresses.length - 1];
    let waypoints = addresses.slice(0, -1);


    let url = new URL("https://www.google.com/maps/dir/");

    url.searchParams.set("api", "1");
    url.searchParams.set("origin", start);
    url.searchParams.set("destination", destination);
    url.searchParams.set("travelmode", "walking");

    if (waypoints.length > 0) 
    {
        url.searchParams.set("waypoints", waypoints.join("|"));
    }

    window.open(url.toString(), "_blank", "noopener,noreferrer");
}

function saveHouses() 
{
    localStorage.setItem("houses", JSON.stringify(houses));
}

let startInput = document.getElementById("startAddress");

// Load the previously saved starting location
startInput.value = localStorage.getItem("startAddress") || "";

// Save whenever the starting location changes
startInput.addEventListener("input", function() {
    localStorage.setItem("startAddress", startInput.value);
});

function clearRoute() { 
    let confirmation = confirm( "Are you sure you want to delete all houses?");

    if (confirmation) { houses = []; saveHouses(); displayHouses(); }
}

function updateProgress() 
{
    let total = houses.length;
    let visited = houses.filter(function(house)
    {
        return house.visited;
    }).length;

    let percentage = total === 0 ? 0 : (visited / total) * 100;

    document.getElementById("progressText").textContent = visited + " out of " + total + " houses visited";

    document.getElementById("progressFill").style.width = percentage + "%";
}


let map = L.map("map").setView([46.7296, -117.1817], 13);

L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
{
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors, HOT'
}).addTo(map);

let houseMarkers = L.layerGroup().addTo(map);   
let candyMarkers = L.layerGroup().addTo(map);


// Convert a Pullman address into map coordinates
async function findAddress(address)
{
    let searchAddress = address + ", Pullman, WA";

    let url = "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
            q: searchAddress,
            format: "json",
            limit: "1",
            countrycodes: "us",
            viewbox: "-117.25,46.80,-117.10,46.68",
            bounded: "1"
        });

    try
    {
        let response = await fetch(url);

        if (!response.ok)
        {
            throw new Error("Address lookup failed");
        }

        let results = await response.json();

        if (results.length === 0)
        {
            return null;
        }

        return {
            lat: Number(results[0].lat),
            lng: Number(results[0].lon)
        };
    }
    catch (error)
    {
        console.error("Could not find address:", error);
        return null;
    }
}

findAddress("405 SE Bishop Blvd").then(function(location)
{
    console.log("Pullman address result:", location);
});

function updateHouseMarkers()
{
    houseMarkers.clearLayers();

    houses.forEach(function(house)
    {
        if (house.lat == null || house.lng == null)
        {
            return;
        }

        let marker = L.marker([house.lat, house.lng]);

        marker.bindPopup("🎃 " + house.address);

        marker.addTo(houseMarkers);
    });
}

updateHouseMarkers();


async function updateCandyMarkers()
{
    candyMarkers.clearLayers();

    // Get registered houses from localStorage
    let registeredHouses = JSON.parse(
        localStorage.getItem("candyHouses")
    ) || [];

    for (let house of registeredHouses)
    {
        // Only show houses giving out candy
        if (!house.givingCandy)
        {
            continue;
        }

        // Find the house coordinates
        let location = await findAddress(house.address);

        if (location === null)
        {
            continue;
        }

        // Create a candy icon
        let candyIcon = L.divIcon({
            html: "🍬",
            className: "candy-pin",
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Create a marker
        let marker = L.marker(
            [location.lat, location.lng],
            { icon: candyIcon }
        );

        // Show house information when clicked
        let popup = document.createElement("div");

        let address = document.createElement("strong");
        address.textContent = house.address;
        popup.appendChild(address);

        let hours = document.createElement("p");
        hours.textContent = "🍬 Candy Hours: " +
            (house.hours || "Not specified");
        popup.appendChild(hours);

        marker.bindPopup(popup);
        marker.addTo(candyMarkers);
    }
}

// Display saved candy houses when the page loads
updateCandyMarkers();
