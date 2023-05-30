window.onload = function() {
  document
    .getElementById("create-plan-button")
    .addEventListener('click', (_event) => {
      window.location.assign(CLIENT_COMPONENTS + 'createPlan/createPlan.html');
    });

  document
    .getElementById("to-dep-graph")
    .addEventListener('click', (_event) => {
      window.location.assign(SERVER_CONTROLLERS + 'get_deps_graph.php');
    });

  fetch(SERVER_CONTROLLERS + 'get_all_plans.php')
    .then(response => response.json())
    .then(({ data }) => displayPlans(JSON.parse(data)))
    .catch(error => console.error('Error:', error));
};

function addColumn(toRow, textContent, className) {
  const column = document.createElement('td');
  column.textContent = textContent;
  column.className = className;
  toRow.appendChild(column);
}

function displayPlans(plans) {
  const plansList = document.getElementById('plans-list');

  // TODO: abstract get requests in function with callback for success/failure
  // TODO: abstract anchor creation under 'td'
  plans.forEach(plan => {
    const row = document.createElement('tr');
    const columnApender = addColumn.bind(this, row);

    columnApender(plan.name, 'plan-name');
    columnApender(plan.owner, 'plan-owner');

    const deleteCell = document.createElement('td');
    deleteCell.textContent = 'Изтрий';
    deleteCell.style.textDecoration = 'underline';
    deleteCell.style.color = 'blue';
    deleteCell.style.cursor = 'pointer';
    deleteCell.addEventListener('click', deletePlan.bind(this, plan));
    row.appendChild(deleteCell);

    const editCell = document.createElement('td');
    const editAnchor = document.createElement('a');
    editAnchor.textContent = 'Редактирай';
    editAnchor.href =
      CLIENT_COMPONENTS + 'editPlan/editPlan.html?'
      + new URLSearchParams({ id: plan.id });
    editCell.appendChild(editAnchor);
    row.appendChild(editCell);

    const viewCell = document.createElement('td');
    const viewAnchor = document.createElement('a');
    viewAnchor.textContent = 'PDF';
    viewAnchor.href =
      SERVER_CONTROLLERS + 'get_pdf.php?'
      + new URLSearchParams({ id: plan.id });
    viewCell.appendChild(viewAnchor);
    row.appendChild(viewCell);

    const exportCell = document.createElement('td');
    exportCell.textContent = 'JSON';
    exportCell.style.textDecoration = 'underline';
    exportCell.style.color = 'blue';
    exportCell.style.cursor = 'pointer';
    exportCell.addEventListener('click', exportJSON.bind(this, plan));
    row.appendChild(exportCell);

    plansList.appendChild(row);
  });
}

function deletePlan(plan) {
  fetch(
    SERVER_CONTROLLERS + 'delete_plan.php?'
    + new URLSearchParams({ id: plan.id }),
    { method: 'DELETE' }
  )
    .then(response => {
      if (response.ok) {
        location.reload();
      }
    }).catch(error => {
      console.error('Error:', error);
      console.error('Failed to delete plan');
    });
}

function exportJSON(plan) {
  fetch(
    SERVER_CONTROLLERS + 'get_plan.php?'
    + new URLSearchParams({ id: plan.id })
  )
    .then(response => response.json())
    .then(data => {
      const jsonData = JSON.stringify(data);
      const blob = new Blob([jsonData], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'data.json';

      link.click();

      URL.revokeObjectURL(link.href);
    })
    .catch(error => {
      console.error('Error:', error);
      console.error('Failed to fetch JSON data.');
    });
}
