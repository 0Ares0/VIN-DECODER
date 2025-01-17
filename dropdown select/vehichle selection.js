const apiBaseUrl = "https://www.carqueryapi.com/api/0.3/";

// Fetch makes from CarQuery API
function fetchMakes() {
  $.getJSON(apiBaseUrl + "?callback=?", { cmd: "getMakes" }, function (data) {
    const makes = data.Makes;
    const makeSelect = document.getElementById("make");
    makeSelect.innerHTML = '<option value="">Select Make</option>'; // Clear existing options
    makes.forEach((make) => {
      const option = document.createElement("option");
      option.value = make.make_id;
      option.textContent = make.make_display;
      makeSelect.appendChild(option);
    });
  });
}

// Fetch models for a specific make
function fetchModels(makeId) {
  $.getJSON(
    apiBaseUrl + "?callback=?",
    { cmd: "getModels", make: makeId },
    function (data) {
      const models = data.Models;
      const modelSelect = document.getElementById("model");
      modelSelect.innerHTML = '<option value="">Select Model</option>'; // Clear existing options
      models.forEach((model) => {
        const option = document.createElement("option");
        option.value = model.model_name;
        option.textContent = model.model_name;
        modelSelect.appendChild(option);
      });
      modelSelect.disabled = false;
    }
  );
}

// Fetch years for a specific make and model
function fetchYears(makeId, modelName) {
  $.getJSON(
    apiBaseUrl + "?callback=?",
    { cmd: "getYears", make: makeId, model: modelName },
    function (data) {
      const years = data.Years;
      const yearSelect = document.getElementById("year");
      yearSelect.innerHTML = '<option value="">Select Year</option>'; // Clear existing options

      // Populate only the available years for the selected model
      for (let i = years.min_year; i <= years.max_year; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
      }
      yearSelect.disabled = false;
    }
  );
}

// Populate makes dropdown on page load
document.addEventListener("DOMContentLoaded", fetchMakes);

// Handle make selection
document.getElementById("make").addEventListener("change", function () {
  const selectedMake = this.value;
  document.getElementById("model").innerHTML =
    '<option value="">Select Model</option>';
  document.getElementById("year").innerHTML =
    '<option value="">Select Year</option>';
  document.getElementById("model").disabled = true;
  document.getElementById("year").disabled = true;

  if (selectedMake) {
    fetchModels(selectedMake);
  }
});

// Handle model selection
document.getElementById("model").addEventListener("change", function () {
  const selectedMake = document.getElementById("make").value;
  const selectedModel = this.value;

  document.getElementById("year").innerHTML =
    '<option value="">Select Year</option>';
  document.getElementById("year").disabled = true;

  if (selectedMake && selectedModel) {
    fetchYears(selectedMake, selectedModel);
  }
});

$(document).ready(function () {
  // Fetch car makes when the page loads
  $.getJSON(
    "https://www.carqueryapi.com/api/0.3/?callback=?",
    { cmd: "getMakes" },
    function (data) {
      var makes = data.Makes;
      var makeSelect = $("#make");

      // Populate the make dropdown with options
      $.each(makes, function (index, make) {
        makeSelect.append(new Option(make.make_display, make.make_id));
      });
    }
  );

  // Fetch car models when a make is selected
  $("#make").change(function () {
    var selectedMake = $(this).val();
    var modelSelect = $("#model");
    modelSelect.empty().append(new Option("Select Model", ""));

    if (selectedMake) {
      $.getJSON(
        "https://www.carqueryapi.com/api/0.3/?callback=?",
        { cmd: "getModels", make: selectedMake },
        function (data) {
          var models = data.Models;

          // Populate the model dropdown with options
          $.each(models, function (index, model) {
            modelSelect.append(new Option(model.model_name, model.model_name));
          });

          modelSelect.prop("disabled", false);
        }
      );
    }
  });
});
