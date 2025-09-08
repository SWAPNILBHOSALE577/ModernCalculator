// Sound effect setup using Tone.js
const synth = new Tone.MonoSynth({
	oscillator: {
		type: "sawtooth"
	},
	envelope: {
		attack: 0.01,
		decay: 0.1,
		sustain: 0.2,
		release: 0.1,
	}
}).toDestination();

function playSound(note) {
    // Tone.start() is needed to start the audio context in the browser
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    const now = Tone.now();
    synth.triggerAttack(note, now);
    // Glide up to a higher pitch quickly to mimic a peacock's call
    synth.frequency.rampTo(Tone.Frequency(note).transpose(7), 0.1, now); // Ramp up a perfect fifth
    synth.triggerRelease(now + 0.15);
}


// Calculator Logic Class
class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    // Clear all values
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    // Delete the last character
    delete() {
        if (this.currentOperand.length <= 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
        this.updateDisplay();
    }

    // Append number to the current operand
    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    // Choose an operation
    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
        this.updateDisplay();
    }
    
    // Display an error message
    displayError() {
        this.currentOperandTextElement.innerText = "Error";
        setTimeout(() => {
            this.clear();
        }, 1000);
    }

    // Perform the calculation
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                   this.displayError();
                   return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        // Round to a reasonable number of decimal places to avoid floating point issues
        this.currentOperand = Math.round(computation * 100000000) / 100000000;
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }
    
    // Format number for display
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    // Update the UI
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// --- Event Listeners and Initialization ---

// DOM Element Selectors
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

// Initialize Calculator
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Add functionality and sound listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        playSound('C5'); // Sound for number buttons
        calculator.appendNumber(button.innerText);
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        playSound('E4'); // Sound for operator buttons
        calculator.chooseOperation(button.innerText);
    });
});

equalsButton.addEventListener('click', button => {
    playSound('G5'); // Sound for equals button
    calculator.compute();
});

allClearButton.addEventListener('click', button => {
    playSound('C4'); // Sound for special buttons
    calculator.clear();
});

deleteButton.addEventListener('click', button => {
    playSound('C4'); // Sound for special buttons
    calculator.delete();
});

// Keyboard support
window.addEventListener('keydown', (e) => {
    const key = e.key;
    
    if (key >= 0 && key <= 9 || key === '.') {
        playSound('C5'); // Sound for numbers
        calculator.appendNumber(key);
    } else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        playSound('G5'); // Sound for equals
        calculator.compute();
    } else if (key === 'Backspace') {
        playSound('C4'); // Sound for delete
        calculator.delete();
    } else if (key === 'Escape') {
        playSound('C4'); // Sound for clear
        calculator.clear();
    } else if (['+', '-', '*', '/'].includes(key)) {
        playSound('E4'); // Sound for operators
        const operation = key === '*' ? '×' : key === '/' ? '÷' : key;
        calculator.chooseOperation(operation);
    }
});

