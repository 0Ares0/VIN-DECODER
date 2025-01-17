const decodeBtn = document.getElementById("decodeBtn");
const recallBtn = document.getElementById("recallBtn");
const vinInput = document.getElementById("vinInput");
const vinOutput = document.getElementById("vinOutput");
const recallOutput = document.getElementById("recallOutput");

// Add event listener for the Decode VIN button
decodeBtn.addEventListener("click", function () {
  const vin = vinInput.value.trim();

  // Check for valid VIN
  if (vin.length !== 17) {
    vinOutput.innerHTML = "Please enter a valid 17-character VIN";
    vinOutput.style.display = "block"; // Show the output box in case of error
    return;
  }

  // Call the decode function
  decodeVIN(vin);
});

// Function to decode the VIN
function decodeVIN(vin) {
  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`)
    .then((response) => response.json())
    .then((data) => {
      // Log the full data to the console to inspect the structure
      console.log("Full Decoded VIN Data:", data);

      // Log each entry in the Results array to inspect available fields
      data.Results.forEach((result) => {
        console.log(`Variable: ${result.Variable}, Value: ${result.Value}`);
      });

      // Try to extract make, model, and year from API data (defaulting to "Not Available" if missing)
      const make =
        data.Results.find((result) => result.Variable === "Make")?.Value ||
        "Not Available";
      const model =
        data.Results.find((result) => result.Variable === "Model")?.Value ||
        "Not Available";
      const year =
        data.Results.find((result) => result.Variable === "Model Year")
          ?.Value || "Not Available";

      console.log("Decoded Make:", make);
      console.log("Decoded Model:", model);
      console.log("Decoded Year:", year);

      vinOutput.innerHTML = `
                <p><strong>Make:</strong> ${make}</p>
                <p><strong>Model:</strong> ${model}</p>
                <p><strong>Year:</strong> ${year}</p>
            `;
      vinOutput.style.display = "block"; // Show the output box when data is ready

      recallBtn.style.display = "block"; // Show the Find Recalls button
    })
    .catch((error) => {
      console.error("Error fetching VIN data:", error);
      vinOutput.innerHTML = "Error fetching VIN data. Please try again later.";
      vinOutput.style.display = "block";
      recallBtn.style.display = "none"; // Hide recall button if decoding fails
    });
}

// Add event listener for the Find Recalls button
recallBtn.addEventListener("click", function () {
  const vin = vinInput.value.trim();

  // Call the function to check for recalls
  checkForRecalls(vin);
});

// Function to check for recalls
function checkForRecalls(vin) {
  fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`)
    .then((response) => response.json())
    .then((data) => {
      const make = data.Results.find(
        (result) => result.Variable === "Make"
      )?.Value;
      const model = data.Results.find(
        (result) => result.Variable === "Model"
      )?.Value;
      const year = data.Results.find(
        (result) => result.Variable === "Model Year"
      )?.Value;

      console.log("Vehicle Details:", { make, model, year });

      if (make && model && year) {
        const recallUrl = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${make}&model=${model}&modelYear=${year}`;
        console.log("Recall API URL:", recallUrl);

        return fetch(recallUrl);
      } else {
        throw new Error("Unable to extract vehicle details for recalls.");
      }
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Recalls Response:", data);

      // Accessing results from the 'results' array
      if (data.results && Array.isArray(data.results)) {
        if (data.Count > 0) {
          let recallOutputHTML = `<p><strong>Recalls Found:</strong> ${data.Count}</p><ul>`;
          data.results.forEach((recall) => {
            recallOutputHTML += `<li>${recall.Description}</li>`; // Assuming 'Description' is a field in the API response
          });
          recallOutputHTML += "</ul>";
          recallOutput.innerHTML = recallOutputHTML;
        } else {
          recallOutput.innerHTML = "<p>No recalls found for this VIN.</p>";
        }
      } else {
        console.error("Unexpected response structure:", data);
        recallOutput.innerHTML =
          "Unexpected response format. Please try again later.";
      }
      recallOutput.style.display = "block"; // Show the output box
    })
    .catch((error) => {
      console.error("Error fetching recalls:", error);
      recallOutput.innerHTML =
        "Error fetching recalls. Please try again later.";
      recallOutput.style.display = "block"; // Show the output box in case of error
    });
}
