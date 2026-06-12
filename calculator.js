/**
 * Car Tax Calculator - Main Logic
 * Handles all calculations and form interactions
 */

class CarTaxCalculator {
  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize all event listeners for form interactions
   */
  initializeEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => this.openTab(e));
    });

    // Car group selection - show/hide custom input
    const carGroupSelect = document.getElementById('car-group');
    if (carGroupSelect) {
      carGroupSelect.addEventListener('change', () => this.toggleCustomValueField());
    }

    // Form submission
    const calculateButton = document.getElementById('calculate-btn');
    if (calculateButton) {
      calculateButton.addEventListener('click', () => this.handleCalculate());
    }

    // Reset form
    const resetButton = document.getElementById('reset-btn');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetForm());
    }
  }

  /**
   * Tab switching functionality
   */
  openTab(evt) {
    const tabName = evt.currentTarget.getAttribute('data-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      content.style.display = 'none';
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.classList.add('active');
  }

  /**
   * Show/hide custom value input based on car group selection
   */
  toggleCustomValueField() {
    const carGroup = document.getElementById('car-group').value;
    const customContainer = document.getElementById('custom-value-container');
    if (customContainer) {
      customContainer.style.display = carGroup === 'custom' ? 'block' : 'none';
    }
  }

  /**
   * Validate and retrieve user inputs with error handling
   * @returns {Object|null} - Input values or null if invalid
   */
  getInputValues() {
    const salary = parseFloat(document.getElementById('salary').value);
    const carGroup = document.getElementById('car-group').value;
    const carType = document.getElementById('car-type').value;
    const creditPointsInput = document.getElementById('credit-points').value;
    const creditPoints = creditPointsInput ? parseFloat(creditPointsInput) : CONFIG.defaultCreditPoints;

    // Validation
    const errors = [];

    if (isNaN(salary) || salary < CONFIG.constraints.minSalary) {
      errors.push('הכנס שכר ברוטו תקין');
    }

    if (!carGroup) {
      errors.push('בחר קבוצת מחיר רכב');
    }

    if (carGroup === 'custom') {
      const customValue = parseFloat(document.getElementById('custom-value')?.value || '');
      if (isNaN(customValue) || customValue < CONFIG.constraints.minCustomValue) {
        errors.push('הכנס שווי שימוש תקין');
      }
    }

    if (isNaN(creditPoints) || creditPoints < CONFIG.constraints.minCreditPoints) {
      errors.push('הכנס מספר נקודות זיכוי תקין');
    }

    if (errors.length > 0) {
      this.showError(errors.join('\n'));
      return null;
    }

    return { salary, carGroup, carType, creditPoints };
  }

  /**
   * Calculate car usage value based on group and type
   * @param {string} carGroup - Car price group
   * @param {string} carType - Car type (regular, hybrid, plugin, electric)
   * @returns {number} - Usage value in ILS
   */
  getCarValue(carGroup, carType) {
    let baseValue = 0;

    if (carGroup === 'custom') {
      const customValue = parseFloat(document.getElementById('custom-value').value);
      return isNaN(customValue) ? 0 : customValue;
    } else if (CONFIG.carGroups[carGroup]) {
      baseValue = CONFIG.carGroups[carGroup].value;
    }

    // Apply discount based on car type
    if (carType === 'hybrid') {
      return Math.max(0, baseValue - CONFIG.discounts.hybrid);
    } else if (carType === 'plugin' || carType === 'electric') {
      return Math.max(0, baseValue - CONFIG.discounts.plugin);
    }

    return baseValue;
  }

  /**
   * Get car type description
   * @param {string} carGroup - Car price group
   * @param {string} carType - Car type
   * @returns {string} - Description
   */
  getCarDescription(carGroup, carType) {
    let groupDesc = '';

    if (carGroup === 'custom') {
      groupDesc = 'רכב בשווי שימוש מותאם אישית';
    } else if (CONFIG.carGroups[carGroup]) {
      groupDesc = CONFIG.carGroups[carGroup].name;
    }

    const typeDescriptions = {
      regular: 'רכב רגיל (בנזין/דיזל)',
      hybrid: 'רכב היברידי',
      plugin: 'רכב היברידי פלאג-אין',
      electric: 'רכב חשמלי'
    };

    const typeDesc = typeDescriptions[carType] || 'רכב רגיל';
    return groupDesc ? `${typeDesc} (${groupDesc})` : typeDesc;
  }

  /**
   * Calculate applicable tax rate based on income
   * Uses progressive tax brackets
   * @param {number} income - Total bruto salary including car value
   * @returns {number} - Tax rate (0.0 - 1.0)
   */
  calculateTaxRate(income) {
    for (const bracket of CONFIG.taxBrackets) {
      if (income <= bracket.limit) {
        return bracket.rate;
      }
    }
    return CONFIG.taxBrackets[CONFIG.taxBrackets.length - 1].rate;
  }

  /**
   * Format number as currency in ILS
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat(CONFIG.currency.locale, {
      style: 'currency',
      currency: CONFIG.currency.code
    }).format(amount);
  }

  /**
   * Main calculation handler
   */
  handleCalculate() {
    const inputs = this.getInputValues();
    if (!inputs) return;

    const { salary, carGroup, carType, creditPoints } = inputs;

    // Calculate car value
    const carValue = this.getCarValue(carGroup, carType);
    const carDescription = this.getCarDescription(carGroup, carType);

    // Calculate total bruto salary
    const totalBrutoSalary = salary + carValue;

    // Calculate tax deduction
    const totalCreditPoints = creditPoints * CONFIG.creditPointValue;
    const taxRate = this.calculateTaxRate(totalBrutoSalary);
    const taxDeduction = carValue * taxRate;

    // Calculate net effect
    const netEffect = carValue - taxDeduction;
    const annualEffect = netEffect * 12;

    // Display results
    this.displayResults({
      salary,
      carDescription,
      carValue,
      totalBrutoSalary,
      creditPoints,
      totalCreditPoints,
      taxRate: (taxRate * 100).toFixed(1),
      taxDeduction,
      netEffect,
      annualEffect
    });

    // Scroll to results
    const resultSection = document.getElementById('result');
    if (resultSection) {
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Display calculation results
   * @param {Object} results - Calculation results
   */
  displayResults(results) {
    const resultElements = {
      'result-salary': results.salary,
      'result-car-details': results.carDescription,
      'result-car-value': results.carValue,
      'result-total-bruto': results.totalBrutoSalary,
      'result-credit-points': results.creditPoints,
      'result-tax-rate': `${results.taxRate}%`,
      'result-tax-deduction': results.taxDeduction,
      'result-net-effect': results.netEffect,
      'result-annual-effect': results.annualEffect
    };

    for (const [elementId, value] of Object.entries(resultElements)) {
      const element = document.getElementById(elementId);
      if (element) {
        if (typeof value === 'number' && elementId !== 'result-credit-points' && !elementId.includes('tax-rate')) {
          element.textContent = this.formatCurrency(value);
        } else {
          element.textContent = typeof value === 'number' ? value.toFixed(2) : value;
        }
      }
    }

    document.getElementById('result').style.display = 'block';
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   */
  showError(message) {
    alert(message);
  }

  /**
   * Reset form to initial state
   */
  resetForm() {
    document.getElementById('calculator-form').reset();
    document.getElementById('result').style.display = 'none';
    document.getElementById('custom-value-container').style.display = 'none';
    document.getElementById('salary').focus();
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CarTaxCalculator();
});
