document.getElementById("panForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    pan: form.pan.value,
    issue: form.issue.value
  };

  fetch("https://script.google.com/macros/s/AKfycbwcuzbvGBjnZOipPAMBhZqGu85gusHoAKh35IcXTDBsiPzLxOcMPP1D2NT9ax6Cdh2o/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(response => {
    document.getElementById("status").innerText = response.message;
  })
  .catch(error => {
    document.getElementById("status").innerText = "Error: " + error.message;
  });
});

