
let candyHouses = JSON.parse(localStorage.getItem("candyHouses")) || [];

// Bring over a house saved by the earlier version.
let oldCandyHouse = JSON.parse(localStorage.getItem("candyHouse"));

if (oldCandyHouse && !localStorage.getItem("candyHouseMigrated"))
{
    candyHouses.push(oldCandyHouse);
    localStorage.setItem("candyHouses", JSON.stringify(candyHouses));
    localStorage.setItem("candyHouseMigrated", "true");
}


async function isValidCandyAddress(address)
{
    try
    {
        let url = "https://nominatim.openstreetmap.org/search?" +
            new URLSearchParams({
                q: address,
                format: "json",
                addressdetails: "1",
                limit: "5"
            });

        let response = await fetch(url);

        if (!response.ok)
        {
            return null;
        }

        let results = await response.json();

        // Only accept a result with a specific house number
        return results.some(function(place)
        {
            return place.address &&
                   place.address.house_number &&
                   place.address.road;
        });
    }
    catch (error)
    {
        return null;
    }
}


async function registerCandyHouse()
{
    let address = document.getElementById("candyAddress").value.trim();
    let status = document.getElementById("candyStatus").value;
    let hours = document.getElementById("candyHours").value.trim();

    if (address === "")
    {
        alert("Please enter your house address!");
        return;
    }

    
    // Check whether the address can be found
    let validAddress = await isValidCandyAddress(address);

    if (validAddress === null)
    {
        alert("Could not verify the address right now. Please try again.");
        return;
    }

    if (!validAddress)
    {
        alert("🎃 Address not found! Please enter a complete house address, including city and state.");
        return;
    }


    let candyHouse = {
        address: address,
        givingCandy: status === "yes",
        hours: hours
    };

    candyHouses.push(candyHouse);

    localStorage.setItem("candyHouses", JSON.stringify(candyHouses));

    document.getElementById("candyMessage").textContent =
        "Your candy house information has been saved! 🎃";

    document.getElementById("candyAddress").value = "";
    document.getElementById("candyHours").value = "";

    displayCandyHouses();
}

function displayCandyHouses()
{
    let list = document.getElementById("candyHouseList");

    list.innerHTML = "";

    candyHouses.forEach(function(house, index)
    {
        let li = document.createElement("li");

        let status = house.givingCandy
            ? "🍬 Giving out candy"
            : "🚫 Not giving out candy";

        li.textContent = house.address + " — " + status +
            (house.hours ? " — " + house.hours : "");

        // Add to Route button
        if (house.givingCandy)
        {
            let button = document.createElement("button");
            button.textContent = "➕ Add to Route";

            button.addEventListener("click", function()
            {
                addRegisteredHouseToRoute(house.address);
            });

            li.appendChild(document.createTextNode(" "));
            li.appendChild(button);
        }

        // Edit button
        let editButton = document.createElement("button");
        editButton.textContent = "✏️ Edit";

        editButton.addEventListener("click", function()
        {
            editCandyHouse(house);
        });

        li.appendChild(document.createTextNode(" "));
        li.appendChild(editButton);

        // NEW: Remove button
        let removeButton = document.createElement("button");
        removeButton.textContent = "🗑️ Remove";

        removeButton.addEventListener("click", function()
        {
            removeCandyHouse(index);
        });

        li.appendChild(document.createTextNode(" "));
        li.appendChild(removeButton);

        list.appendChild(li);
    });
}

// Add registered house to route
function addRegisteredHouseToRoute(address)
{
    let alreadyAdded = houses.some(function(house)
    {
        return house.address.trim().toLowerCase() ===
               address.trim().toLowerCase();
    });

    if (alreadyAdded)
    {
        alert("🎃 This house is already on your route!");
        return;
    }

    let houseInput = document.getElementById("houseAddress");
    houseInput.value = address;

    if (typeof addHouse === "function")
    {
        addHouse();
    }
    else
    {
        alert("Route planner is not available.");
    }
}

// UPDATED: Edit house information
function editCandyHouse(house)
{
    let newAddress = prompt(
        "Edit house address:",
        house.address
    );

    if (newAddress === null) return;

    newAddress = newAddress.trim();

    if (newAddress === "")
    {
        alert("House address cannot be empty!");
        return;
    }

    let newHours = prompt(
        "Edit candy hours:",
        house.hours
    );

    if (newHours === null) return;

    let newStatus = confirm(
        "Is this house giving out candy?\n\n" +
        "OK = Yes\nCancel = No"
    );

    house.address = newAddress;
    house.hours = newHours.trim();
    house.givingCandy = newStatus;

    localStorage.setItem(
        "candyHouses",
        JSON.stringify(candyHouses)
    );

    displayCandyHouses();
updateCandyMarkers();

alert("🎃 House information updated!");
}

// NEW: Remove a registered house
function removeCandyHouse(index)
{
    let confirmation = confirm(
        "Are you sure you want to remove this registered house?"
    );

    if (!confirmation)
    {
        return;
    }

    candyHouses.splice(index, 1);

    localStorage.setItem(
        "candyHouses",
        JSON.stringify(candyHouses)
    );

    displayCandyHouses();
}

displayCandyHouses();
updateCandyMarkers();
