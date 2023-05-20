window.onload = function() {
  document
    .getElementById("create-plan-button")
    .addEventListener('click', (_event) => {
      window.location.assign(CLIENT_COMPONENTS + 'createPlan/createPlan.html');
    });

  document.getElementById('upload-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const file = document.getElementById('file-input').files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        // TODO: validate json fields
        const jsonData = event.target.result;
        fetch(
          SERVER_CONTROLLERS + 'create_plan.php',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: jsonData
          })
          .then(response => {
            if (response.ok) {
              window.location.assign(CLIENT_COMPONENTS + 'listPlans/listPlans.html');
            } else {
              console.error("Failed to create plan");
            }
          })
          .catch(error => {
            console.error('Error:', error);
            console.error("Failed to create plan");
          });
      };

      reader.readAsText(file);
    }

  });

  fetch(SERVER_CONTROLLERS + 'get_all_plans.php')
    .then(response => response.json())
    .then(({ data }) => displayPlans(JSON.parse(data)))
    .catch(error => console.error('Error:', error));
};

function addColumn(toRow, textContent, className) {
  const column = document.createElement('td');
  column.className = className;
  column.textContent = textContent;
  toRow.appendChild(column);
}

function displayPlans(plans) {
  const plansList = document.getElementById('plans-list');

  // TODO: abstract get requests in function with callback for success/failure
  plans.forEach(plan => {
    const row = document.createElement('tr');
    const columnApender = addColumn.bind(this, row);

    columnApender(plan.name, 'plan-name');
    columnApender(plan.description);
    columnApender(plan.owner);

    const actionsCell = document.createElement('td');
    actionsCell.setAttribute('class', 'actions-cell');

    const editAnchor = document.createElement('a');
    editAnchor.textContent = 'Edit';
    editAnchor.href =
      CLIENT_COMPONENTS
      + 'editPlan/editPlan.html?'
      + new URLSearchParams({ id: plan.id });
    actionsCell.appendChild(editAnchor);

    const viewAnchor = document.createElement('a');
    viewAnchor.textContent = 'View PDF';
    viewAnchor.href =
      SERVER_CONTROLLERS
      + 'get_pdf.php?'
      + new URLSearchParams({ id: plan.id });
    actionsCell.appendChild(viewAnchor);

    // TODO
    const exportAnchor = document.createElement('a');
    exportAnchor.textContent = 'Export JSON';
    exportAnchor.addEventListener('click', () => {
      fetch(
        SERVER_CONTROLLERS
        + 'get_plan.php?'
        + new URLSearchParams({ id: plan.id })
      )
        .then(response => response.json())
        .then(data => {
          const jsonData = JSON.stringify(data);
          const blob = new Blob([jsonData], { type: 'application/json' });

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'data.json';
          link.style.textDecoration = 'underline';
          link.style.color = 'blue';
          link.style.cursor = 'pointer';

          link.click();

          URL.revokeObjectURL(link.href);
        })
        .catch(error => {
          console.error('Error:', error);
          console.error('Failed to fetch JSON data.');
        });
    });
    // exportAnchor.href =
    //   SERVER_CONTROLLERS
    //   + 'get_plan.php?'
    //   + new URLSearchParams({ id: plan.id });
    actionsCell.appendChild(exportAnchor);

    row.appendChild(actionsCell);

    plansList.appendChild(row);
  });
}
