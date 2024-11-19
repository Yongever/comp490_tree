import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
 
const supabaseUrl = 'https://qrpsxkszvsneojwdzufr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycHN4a3N6dnNuZW9qd2R6dWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1Mzg1NjQsImV4cCI6MjA0NTExNDU2NH0.D_oViY50-8-q-NYsRimWiTwLgoxblkkf0XLo5-qfgXc';
const supabase = createClient(supabaseUrl, supabaseKey);
 
const action = localStorage.getItem('selectedAction'); // Retrieve the selected action from treeOptions.html
const fetchButton = document.getElementById('fetchButton');
const submitButton = document.getElementById('submitButton');
const treeIdInput = document.getElementById('treeId');
const additionalFields = document.getElementById('additionalFields');
const messageDiv = document.getElementById('message');
 
// Initialize the page based on the action
document.addEventListener('DOMContentLoaded', () => {
  if (action === 'add') {
    initializeBlankForm();
  } else if (action === 'edit' || action === 'remove') {
    fetchButton.style.display = 'block'; // Show the fetch button
    treeIdInput.style.display = 'block'; // Require Tree Tag ID for Edit/Remove
    if (action === 'remove') {
      submitButton.textContent = 'Delete Tree'; // Update button text for Delete
    }
  }
});
 
// Initialize blank fields for the Add action
function initializeBlankForm() {
  document.getElementById('dbh2019').value = '';
  document.getElementById('dbh2022').value = '';
  document.getElementById('speciesCodePrefix').value = '';
  document.getElementById('speciesCodeNumber').value = '';
  document.getElementById('latinName').value = '';
  document.getElementById('species').value = '';
  document.getElementById('hazardRat').value = '';
  document.getElementById('sun').value = '';
  document.getElementById('hazard').value = '';
 
  additionalFields.style.display = 'block'; // Show the fields
  fetchButton.style.display = 'none'; // Hide the fetch button for Add
}
 
// Fetch tree data based on tree ID for Edit or Remove
fetchButton.addEventListener('click', async () => {
  const treeId = treeIdInput.value;
 
  if (!treeId) {
    showMessage('Please enter a valid Tree Tag Number.', 'red');
    return;
  }
 
  try {
    const { data, error } = await supabase
      .from('CampusTreesFinal') // Updated table name
      .select('*')
      .eq('Tag_Number', treeId) // Updated column name based on your structure
      .single();
 
    if (error || !data) {
      showMessage(`Tree with Tag Number ${treeId} not found.`, 'red');
      return;
    }
 
    // Populate the fields with the fetched tree data
    document.getElementById('dbh2019').value = data.DBH_2019 || '';
    document.getElementById('dbh2022').value = data.DBH_2022 || '';
    const speciesCode = data['Species Co'] || '';
    document.getElementById('speciesCodePrefix').value = speciesCode.replace(/[0-9]/g, '');
    document.getElementById('speciesCodeNumber').value = speciesCode.replace(/[^0-9]/g, '');
    document.getElementById('latinName').value = data.LatinName || '';
    document.getElementById('species').value = data['Species _1'] || '';
    document.getElementById('hazardRat').value = data.Hazard_Rat || '';
    document.getElementById('sun').value = data.Sun || '';
    document.getElementById('hazard').value = data.Hazard || '';
 
    additionalFields.style.display = 'block';
    showMessage('Tree data loaded successfully.', 'green');
  } catch (error) {
    showMessage(`Error fetching tree data: ${error.message}`, 'red');
  }
});
 
// Handle form submission for Add/Edit/Delete
submitButton.addEventListener('click', async () => {
  const treeId = treeIdInput.value;
 
  if (!treeId && action !== 'add') {
    showMessage('Please enter a valid Tree Tag Number.', 'red');
    return;
  }
 
  try {
    if (action === 'add') {
      // Add a new tree
      const dbh2019 = document.getElementById('dbh2019').value;
      const dbh2022 = document.getElementById('dbh2022').value;
      const speciesCodePrefix = document.getElementById('speciesCodePrefix').value;
      const speciesCodeNumber = document.getElementById('speciesCodeNumber').value;
      const speciesCo = speciesCodePrefix + speciesCodeNumber;
      const latinName = document.getElementById('latinName').value;
      const species = document.getElementById('species').value;
      const hazardRat = document.getElementById('hazardRat').value;
      const sun = document.getElementById('sun').value;
      const hazard = document.getElementById('hazard').value;
 
      const { error } = await supabase.from('CampusTreesFinal').insert([{
        Tag_Number: treeId,
        DBH_2019: dbh2019,
        DBH_2022: dbh2022,
        'Species Co': speciesCo,
        LatinName: latinName,
        'Species _1': species,
        Hazard_Rat: hazardRat,
        Sun: sun,
        Hazard: hazard
      }]);
      if (error) throw error;
      showMessage('Tree added successfully.', 'green');
    } else if (action === 'edit') {
      // Edit an existing tree
      const dbh2019 = document.getElementById('dbh2019').value;
      const dbh2022 = document.getElementById('dbh2022').value;
      const speciesCodePrefix = document.getElementById('speciesCodePrefix').value;
      const speciesCodeNumber = document.getElementById('speciesCodeNumber').value;
      const speciesCo = speciesCodePrefix + speciesCodeNumber;
      const latinName = document.getElementById('latinName').value;
      const species = document.getElementById('species').value;
      const hazardRat = document.getElementById('hazardRat').value;
      const sun = document.getElementById('sun').value;
      const hazard = document.getElementById('hazard').value;
 
      const { error } = await supabase.from('CampusTreesFinal').update({
        DBH_2019: dbh2019,
        DBH_2022: dbh2022,
        'Species Co': speciesCo,
        LatinName: latinName,
        'Species _1': species,
        Hazard_Rat: hazardRat,
        Sun: sun,
        Hazard: hazard
      }).eq('Tag_Number', treeId);
      if (error) throw error;
      showMessage('Tree updated successfully.', 'green');
    } else if (action === 'remove') {
      // Delete a tree
      const { error } = await supabase.from('CampusTreesFinal').delete().eq('Tag_Number', treeId);
      if (error) throw error;
      showMessage('Tree deleted successfully.', 'green');
      initializeBlankForm(); // Clear fields after deletion
    }
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'red');
  }
});
 
// Helper function to show messages
function showMessage(message, color = 'green') {
  messageDiv.textContent = message;
  messageDiv.style.color = color;
}
 
 
updateLoginStatus();