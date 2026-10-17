
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

function addHouse() 
{
    let input = document.getElementById("houseAddress");
    let address = input.value.trim();

    if (address === "")
        {
        alert("Please enter a house address!");
        return;
        }

    houses.push({
    address: address,
    visited: false
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

displayHouses();
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