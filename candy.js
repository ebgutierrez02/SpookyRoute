
let candyHouses = JSON.parse(localStorage.getItem("candyHouses")) || [];

// Bring over a house saved by the earlier version.
let oldCandyHouse = JSON.parse(localStorage.getItem("candyHouse"));

if (oldCandyHouse && !localStorage.getItem("candyHouseMigrated"))
{
    candyHouses.push(oldCandyHouse);
    localStorage.setItem("candyHouses", JSON.stringify(candyHouses));
    localStorage.setItem("candyHouseMigrated", "true");
}

function registerCandyHouse()
{
    let address = document.getElementById("candyAddress").value.trim();
    let status = document.getElementById("candyStatus").value;
    let hours = document.getElementById("candyHours").value.trim();

    if (address === "")
    {
        alert("Please enter your house address!");
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

    candyHouses.forEach(function(house)
    {
        let li = document.createElement("li");

        let status = house.givingCandy
            ? "🍬 Giving out candy"
            : "🚫 Not giving out candy";

        li.textContent = house.address + " — " + status +
            (house.hours ? " — " + house.hours : "");

        // NEW: Add a button for houses giving out candy
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

        list.appendChild(li);
    });
}

// NEW: Send registered house address to route planner
function addRegisteredHouseToRoute(address)
{
    let houseInput = document.getElementById("houseAddress");

    houseInput.value = address;

    // Use the existing route function from script.js
    if (typeof addHouse === "function")
    {
        addHouse();
    }
    else
    {
        alert("Route planner is not available.");
    }
}

displayCandyHouses();