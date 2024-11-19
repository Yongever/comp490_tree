// Jenkins coefficients for groups of species
const jenkinsCoefficients = {
    Group1: { a: 0.58, b: 2.25, species: ['White Oak', 'Northern Red Oak', 'Shingle Oak', 'Bur Oak', 'Pin Oak', 'Red Oak'] },
    Group2: { a: 0.53, b: 2.15, species: ['Norway Maple', 'Boxelder', 'Japanese Maple', 'Paperbark Maple', 'Red Maple'] },
    Group3: { a: 0.60, b: 2.30, species: ['American Elm', 'Black Locust', 'Siberian Elm', 'Black Cherry'] },
    Group4: { a: 0.62, b: 2.20, species: ['Northern Catalpa', 'Northern Hackberry', 'Black Hawthorn', 'Callery Pear', 'Eastern Redbud', 'Tree of Heaven'] },
    Group5: { a: 0.67, b: 2.35, species: ['Black Walnut'] },
    Group6: { a: 0.63, b: 2.20, species: ['American Basswood', 'Big Leaf Linden', 'Little Leaf Linden'] },
    Group7: { a: 0.61, b: 2.30, species: ['Horse Chestnut', 'Ohio Buckeye'] },
    Group8: { a: 0.50, b: 2.35, species: ['Austrian Pine', 'Eastern White Pine', 'Scotch Pine'] },
    Group9: { a: 0.47, b: 2.45, species: ['Norway Spruce', 'White Spruce', 'Blue Spruce'] },
    Group10: { a: 0.55, b: 2.40, species: ['English Yew', 'American Beech', 'European Beech'] },
    Group11: { a: 0.44, b: 2.55, species: ['Douglas-fir'] },
    Group12: { a: 0.53, b: 2.15, species: ['River Birch', 'Paper Birch'] },
    Group13: { a: 0.62, b: 2.25, species: ['Florida Dogwood', 'Kousa Dogwood', 'Black Hawthorne'] },
    Group14: { a: 0.51, b: 2.50, species: ['Dawn Redwood'] },
    Group15: { a: 0.59, b: 2.30, species: ['Tuliptree'] },
    Group16: { a: 0.55, b: 2.35, species: ['Ginkgo'] },
    Group17: { a: 0.52, b: 2.50, species: ['Fraser Fir'] },
  };
  
  // Normalize species names for consistent matching
  function normalizeSpeciesName(species) {
    if (!species) return '';
    return species.trim().toLowerCase().replace(/\s+/g, ' ');
  }
  
  // Helper function to find Jenkins coefficients by species
  function getJenkinsCoefficients(species) {
    const normalizedSpecies = normalizeSpeciesName(species);
  
    for (const group in jenkinsCoefficients) {
      const speciesList = jenkinsCoefficients[group].species.map(normalizeSpeciesName);
      if (speciesList.includes(normalizedSpecies)) {
        return jenkinsCoefficients[group];
      }
    }
    return null;
  }
  
  // Calculate carbon sequestration for a tree
  export function calculateCarbon(dbh, species) {
    if (!species) {
      console.warn('Species is undefined or missing. Defaulting to 0 carbon sequestered.');
      return 0;
    }
  
    const coefficients = getJenkinsCoefficients(species);
    if (!coefficients) {
      console.warn(`Species "${species}" does not match any predefined group. Defaulting to 0 carbon sequestered.`);
      return 0;
    }
  
    const { a, b } = coefficients;
    return a * Math.pow(dbh || 0, b);
  }
  