import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { calculateCarbon } from './carbon_sequestration.js';

const supabaseUrl = 'https://qrpsxkszvsneojwdzufr.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycHN4a3N6dnNuZW9qd2R6dWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1Mzg1NjQsImV4cCI6MjA0NTExNDU2NH0.D_oViY50-8-q-NYsRimWiTwLgoxblkkf0XLo5-qfgXc';
const supabase = createClient(supabaseUrl, supabaseKey);



let speciesSelect = [];
let bool1 = false;
let allData = [];
let allColumns = [];



// Function to fetch data from the Supabase table
async function getTreeData() {
  const excludedColumns = [
    'TagNumber', 'Max_PDOP', 'GPS_Date', 'Feat_Name', 'Unfilt_Pos',
    'Data_Dicti', 'Point_ID', 'path', 'Notes', 'Corr_Type', 'GPS_Time',
    'Datafile', 'Std_Dev', 'layer', 'Azimuth', 'Buil Vinta',
  ];

  const { data: CampusTreesFinal, error } = await supabase
    .from('CampusTreesFinal')
    .select('*');

  if (error) {
    console.error('Error fetching data from CampusTreesFinal:', error);
    return;
  }

  if (CampusTreesFinal.length === 0) {
    console.log('No data found in the CampusTreesFinal table.');
  } else {
    console.log(`Fetched ${CampusTreesFinal.length} rows successfully.`);

    // Calculate carbon sequestration dynamically
    const enhancedData = CampusTreesFinal.map((tree) => {
      const carbon = calculateCarbon(tree.DBH_2022, tree['Species _1']);
      return { ...tree, Carbon_Sequestered: carbon.toFixed(2) };
    });

    allData = enhancedData.map((tree) => {
      const filteredTree = { ...tree };
      excludedColumns.forEach((col) => delete filteredTree[col]);
      return filteredTree;
    });

    allData = removeDuplicateTrees(allData);
    allColumns = Object.keys(allData[0]);

    populateSpeciesDropdown(allData);
    populateColumnCheckboxes(allColumns);
    displayTreeData(allData);
  }
}

// Function to populate the species dropdown
function populateSpeciesDropdown(CampusTreesFinal) {
  const speciesDropdown = document.getElementById('speciesDropdown');
  const speciesSet = new Set(CampusTreesFinal.map(tree => tree['Species _1']));
  speciesSelect = allData;

  speciesSet.forEach(species => {
    const option = document.createElement('option');
    option.value = species;
    option.textContent = species;
    speciesDropdown.appendChild(option);
  });

  speciesDropdown.addEventListener('change', (event) => {
    const selectedSpecies = event.target.value;
    if (selectedSpecies === 'All') {
      displayTreeData(allData);
      speciesSelect = allData;
    } else {
      const filteredData = allData.filter(tree => tree['Species _1'] === selectedSpecies);
      displayTreeData(filteredData);
      speciesSelect = filteredData;
    }
  });
}

// Function to populate checkboxes for all columns dynamically
function populateColumnCheckboxes(columns) {
  const checkboxesContainer = document.querySelector('.checkboxes');

  columns.forEach(column => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `col${column}`;
    checkbox.name = 'columns';
    checkbox.value = column;
    checkbox.checked = true;

    const label = document.createElement('label');
    label.htmlFor = `col${column}`;
    label.textContent = column.replace('_', ' ');

    checkboxesContainer.appendChild(checkbox);
    checkboxesContainer.appendChild(label);
  });

  const checkboxes = document.querySelectorAll('input[name="columns"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      displayTreeData(speciesSelect);
    });
  });

  document.getElementById('selectAllBtn').addEventListener('click', () => {
    checkboxes.forEach(checkbox => (checkbox.checked = true));
    displayTreeData(allData);
  });

  document.getElementById('deselectAllBtn').addEventListener('click', () => {
    checkboxes.forEach(checkbox => (checkbox.checked = false));
    displayTreeData(allData);
  });
}

// Function to display table headers dynamically
function displayTableHeaders(selectedColumns) {
  const tableHeaderRow = document.querySelector('#trees-table thead tr');
  tableHeaderRow.innerHTML = '';  // Clear existing headers
 
  let count = 0;

  selectedColumns.forEach(column => {
    const th = document.createElement('th');

    count ++; 
       
    const headerText = column.replace(/_/g, ' ');
    th.textContent = headerText;
    
    th.className = `headertb`;

    th.textContent = column.replace('_', ' ');  // Replace underscores with spaces for better display
    tableHeaderRow.appendChild(th); 

    th.id = headerText.toLowerCase().replace(/ /g, '_');
  });

  setupHeaderEventListeners();
  //setupHeaderEventListeners(); // hover pop up window test
}

// Function to display the data in an HTML table dynamically based on selected columns
function displayTreeData(CampusTreesFinal) {
  const selectedColumns = getSelectedColumns();
  displayTableHeaders(selectedColumns);

  const tableBody = document.querySelector('#trees-table tbody');
  tableBody.innerHTML = '';

  CampusTreesFinal.forEach(tree => {
    const tableRow = document.createElement('tr');

    selectedColumns.forEach(column => {
      const td = document.createElement('td');
      td.textContent = tree[column];
      tableRow.appendChild(td);
    });

    tableBody.appendChild(tableRow);
  });

  
}

// Function to get selected columns
function getSelectedColumns() {
  const checkboxes = document.querySelectorAll('input[name="columns"]:checked');
  return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Remove duplicate trees based on specific logic
function removeDuplicateTrees(data) {
  const duplicateTags = [23, 124, 290, 342, 388, 523, 546, 589, 673, 676, 711, 718, 803, 1148, 1184];
  const uniqueTrees = {};

  data.forEach(tree => {
    if (duplicateTags.includes(tree.Tag_Number)) {
      if (!uniqueTrees[tree.Tag_Number] || uniqueTrees[tree.Tag_Number].DBH_2022 < tree.DBH_2022) {
        uniqueTrees[tree.Tag_Number] = tree;
      }
    } else {
      uniqueTrees[tree.Tag_Number] = tree;
    }
  });

  return Object.values(uniqueTrees);
}

function setupHeaderEventListeners() {
  const headers = document.querySelectorAll('.headertb');
  const tooltip = document.getElementById('tooltip');

  headers.forEach(header => {
      header.addEventListener('mouseover', function(e) {
          const title = getTooltipTitle(this.id);
          const description = getTooltipDescription(this.id);
          tooltip.innerHTML = `<h3 class = "h3tt" >${title}</h3><p>${description}</p>`;
          tooltip.style.display = 'block';
          tooltip.style.maxWidth = '200px';
          tooltip.style.backgroundColor = ' rgba(9, 59, 23, 0.8)';
          
          tooltip.querySelector('.h3tt').style.paddingBottom = '10px';

          if(title == 'none'){
              tooltip.style.display = 'none';
              }
          else{
              positionTooltip(e, this.id);
          }
          /*if(this.id == 'header-26'){
              tooltip.style.right = e.pageX + 10 + 'px';
              tooltip.style.top = e.pageY + 10 + 'px';
          }
          else{
              tooltip.style.left = e.pageX + 10 + 'px';
              tooltip.style.top = e.pageY + 10 + 'px';
          }*/
      });

      header.addEventListener('mouseout', function() {
          tooltip.style.display = 'none';
      });

      header.addEventListener('mousemove', function(e) {

          positionTooltip(e, this.id);
          
      });

      
  });
}

function positionTooltip(e, headerId) {
  const tooltip = document.getElementById('tooltip');
  const tooltipWidth = tooltip.offsetWidth;
  const windowWidth = window.innerWidth;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  let leftPosition;
  if (headerId === 'header-26') {
      // Position to the left of the mouse for header-26
      leftPosition = e.clientX - tooltipWidth - 10 + scrollX;
  } else {
      // Position to the right of the mouse for other headers
      leftPosition = e.clientX + 10 + scrollX;
  }

  // Ensure the tooltip doesn't go off-screen
  if (leftPosition + tooltipWidth > windowWidth) {
      leftPosition = windowWidth - tooltipWidth - 10;
  }
  if (leftPosition < 0) {
      leftPosition = 10;
  }

  tooltip.style.left = leftPosition + 'px';
  tooltip.style.top = (e.clientY + 10 + scrollY) + 'px';
}

function getTooltipTitle(headerId) {
  const titles = {
      'tag_number': 'Tag Number',
      'hazard_rat': 'Hazard Rating',
      'dbh_2022': 'DBH 2022 (Diameter at Breast Height)',
      'max_pdop': 'Max PDOP (Position Dilution of Precision)',
      'corr_type': 'Corr Type (Correction Type)',
      'unfilt_pos': 'Unfilt Pos (Unfiltered Position)',
      'filt_pos': 'Filt Pos (Filtered Position)',
      'std_dev': 'Std Dev (Standard Deviation)',
      'point_id': 'Point ID',
      'layer': 'Layer',
      'species_co': 'Species code',
      'dbh_2019': 'DBH 2019',
      'azimuth': 'Azimuth',
      'dist_to_bu': 'Dist to bu (Distance to Building)',
      'buil_vinta': 'Buil Vinta (Building Vintage)',
      'sun': 'Sun',
      'hazard': 'Hazard'
  };
  return titles[headerId] || 'none';
}

function getTooltipDescription(headerId) {
  const descriptions = {
      'tag_number': 'A unique identifier for each tree',
      'hazard_rat': 'Indicates the tree\'s condition ("Healthy" or "Some Distress")',
      'dbh_2022': 'Measurement of the tree\'s trunk diameter in 2022, which helps assess growth and tree health',
      'max_pdop': 'Reflects GPS accuracy; lower values indicate better accuracy',
      'corr_type': 'The type of GPS correction applied. In this case, it\'s "Real-time SBAS Corrected" (Satellite-Based Augmentation System), improving positional accuracy',
      'unfilt_pos': 'Represents the raw GPS data collected without any post-processing or filtering',
      'filt_pos': 'Refers to GPS data that has been processed with filtering techniques to improve accuracy',
      'std_dev': 'Indicates how much the recorded GPS positions vary from the average position',
      'point_id': ' Identifier assigned to each data tree and serves as a reference to distinguish one specific recorded location from another',
      'layer': 'Refers to the specific GIS (Geographic Information System) where the data point is stored',
      'species_co': 'Short code for the tree species (e.g. ACPL for Acer Platanoides)',
      'dbh_2019': 'Previous DBH measurement from 2019',
      'azimuth': 'Indicates the direction, measured in degrees, from the tree to a building from a fixed point. (0° representing north, 90° representing east, 180° representing south, and 270° representing west)',
      'dist_to_bu': 'Refers to the distance from the tree to the nearest building measured in feet',
      'buil_vinta': 'Indicates whether the nearby building was constructed after 1980 or before 1950',
      'sun': 'Refers to the sun exposure or sunlight availability for each tree. “Full Sun” = Direct sunlight for most of the day. “Partial Sun/Shade” = Some sunlight but is shaded for parts of the day. “Full Shade” = Little to no direct sunlight',
      'hazard': 'Refers to the rating of risk or potential danger associated with each tree'
  };
  return descriptions[headerId] || 'No description available';
}
// Fetch the data when the page loads
getTreeData();
