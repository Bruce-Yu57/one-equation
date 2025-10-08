/**
 * equationGenerator.js
 * 用於生成不同難度等級的一元一次方程式及其答案。
 */

class Fraction {
    constructor(numerator, denominator = 1) {
        if (denominator === 0) {
            throw new Error("Denominator cannot be zero.");
        }
        this.numerator = numerator;
        this.denominator = denominator;
        this.simplify();
    }

    static fromDecimal(decimal) {
        if (decimal === 0) return new Fraction(0, 1);
        const sign = Math.sign(decimal);
        decimal = Math.abs(decimal);
        const tolerance = 1.0E-6; // Set a tolerance for floating point comparisons
        let h1 = 1, h2 = 0;
        let k1 = 0, k2 = 1;
        let b = decimal;
        do {
            let a = Math.floor(b);
            let aux = h1;
            h1 = a * h1 + h2;
            h2 = aux;
            aux = k1;
            k1 = a * k1 + k2;
            k2 = aux;
            b = 1 / (b - a);
        } while (Math.abs(decimal - h1 / k1) > decimal * tolerance && k1 < 10000); // Limit k1 to prevent infinite loops
        return new Fraction(sign * h1, k1);
    }

    add(other) {
        const commonDenominator = this.denominator * other.denominator;
        const newNumerator = this.numerator * other.denominator + other.numerator * this.denominator;
        return new Fraction(newNumerator, commonDenominator);
    }

    subtract(other) {
        const commonDenominator = this.denominator * other.denominator;
        const newNumerator = this.numerator * other.denominator - other.numerator * this.denominator;
        return new Fraction(newNumerator, commonDenominator);
    }

    multiply(other) {
        return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
    }

    divide(other) {
        if (other.numerator === 0) {
            throw new Error("Cannot divide by zero.");
        }
        return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
    }

    equals(other) {
        return this.numerator === other.numerator && this.denominator === other.denominator;
    }

    toString() {
        if (this.denominator === 1) {
            return this.numerator.toString();
        } else if (this.numerator === 0) {
            return "0";
        } else {
            return `${this.numerator}/${this.denominator}`;
        }
    }

    toEquationString() {
        if (this.denominator === 1) {
            return this.numerator.toString();
        } else if (this.numerator === 0) {
            return "0";
        } else {
            // 處理負數分數，將負號放在分數外面
            if (this.numerator < 0) {
                return `-\\frac{${Math.abs(this.numerator)}}{${this.denominator}}`;
            } else {
                return `\\frac{${this.numerator}}{${this.denominator}}`;
            }
        }
    }

    simplify() {
        if (this.numerator === 0) {
            this.denominator = 1;
            return;
        }
        const gcd = this._gcd(Math.abs(this.numerator), Math.abs(this.denominator));
        this.numerator /= gcd;
        this.denominator /= gcd;
        if (this.denominator < 0) {
            this.numerator *= -1;
            this.denominator *= -1;
        }
    }

    _gcd(a, b) {
        return b === 0 ? a : this._gcd(b, a % b);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInteger(min, max) {
    return new Fraction(getRandomInt(min, max), 1);
}

function getRandomFraction(min, max, allowInteger = true) {
    let numerator = getRandomInt(min, max);
    let denominator = getRandomInt(1, 5); // Denominators up to 5
    if (allowInteger && Math.random() < 0.5) {
        denominator = 1; // 50% chance to be an integer
    }
    return new Fraction(numerator, denominator);
}

function generateEquation(level) {
    let equation = '';
    let answer;
    let a, b, c, d;

    switch (level) {
        case 1: // 基礎一階 (單步加減方程式)
            a = getRandomInteger(-10, 10); // Ensure integers for a
            b = getRandomInteger(-10, 10); // Ensure integers for b
            let op1 = Math.random() < 0.5 ? '+' : '-';

            if (op1 === '+') {
                // 如果a是負數，用括號包起來
                const aStr = a.numerator < 0 ? `(${a.toEquationString()})` : a.toEquationString();
                equation = `x + ${aStr} = ${b.toEquationString()}`;
                answer = b.subtract(a);
            } else {
                // 如果a是負數，用括號包起來
                const aStr = a.numerator < 0 ? `(${a.toEquationString()})` : a.toEquationString();
                equation = `x - ${aStr} = ${b.toEquationString()}`;
                answer = b.add(a);
            }
            break;

        case 2: // 基礎二階 (單步乘除方程式)
            a = getRandomInteger(-5, 5); // Ensure integers for a
            while (a.numerator === 0) { // Avoid 0x = ...
                a = getRandomInteger(-5, 5);
            }
            b = getRandomInteger(-20, 20); // Ensure integers for b
            let op2 = Math.random() < 0.5 ? '*' : '/';

            if (op2 === '*') {
                equation = `${a.toEquationString()}x = ${b.toEquationString()}`;
                answer = b.divide(a);
            } else {
                // 確保分母不為0且為正數
                const denominator = Math.abs(a.numerator);
                equation = `\\frac{x}{${denominator}} = ${b.toEquationString()}`;
                answer = b.multiply(new Fraction(denominator, 1));
            }
            break;

        case 3: // 進階二步驟 (加減＋乘除)
            a = getRandomInteger(-5, 5); // Coefficient of x
            while (a.numerator === 0) { // Avoid 0x + ...
                a = getRandomInteger(-5, 5);
            }
            b = getRandomInteger(-10, 10); // Constant term
            c = getRandomInteger(-20, 20); // Right side constant

            const absB = new Fraction(Math.abs(b.numerator), b.denominator);
            equation = `${a.toEquationString()}x ${b.numerator >= 0 ? '+' : '-'} ${absB.toEquationString()} = ${c.toEquationString()}`;
            // ax + b = c  => ax = c - b => x = (c - b) / a
            answer = c.subtract(b).divide(a);
            break;

        case 4: // 左右變量 (變量同時出現在等號兩邊)
            a = getRandomInteger(-5, 5); // Coefficient of x on left
            b = getRandomInteger(-10, 10); // Constant on left
            c = getRandomInteger(-5, 5); // Coefficient of x on right
            d = getRandomInteger(-10, 10); // Constant on right

            // Ensure coefficients of x are different to avoid trivial or no solution cases
            while (a.equals(c)) {
                c = getRandomFraction(-5, 5, false);
            }

            const absB4 = new Fraction(Math.abs(b.numerator), b.denominator);
            const absD = new Fraction(Math.abs(d.numerator), d.denominator);
            equation = `${a.toEquationString()}x ${b.numerator >= 0 ? '+' : '-'} ${absB4.toEquationString()} = ${c.toEquationString()}x ${d.numerator >= 0 ? '+' : '-'} ${absD.toEquationString()}`;
            // ax + b = cx + d => ax - cx = d - b => (a - c)x = d - b => x = (d - b) / (a - c)
            answer = d.subtract(b).divide(a.subtract(c));
            break;

        case 5: // 括號與分配律
            a = getRandomInteger(-3, 3); // Coefficient outside parenthesis
            while (a.numerator === 0) {
                a = getRandomInteger(-3, 3);
            }
            b = getRandomInteger(-5, 5); // Coefficient of x inside parenthesis
            while (b.numerator === 0) {
                b = getRandomInteger(-5, 5);
            }
            c = getRandomInteger(-10, 10); // Constant inside parenthesis
            d = getRandomInteger(-20, 20); // Right side constant

            const absC = new Fraction(Math.abs(c.numerator), c.denominator);
            equation = `${a.toEquationString()}(${b.toEquationString()}x ${c.numerator >= 0 ? '+' : '-'} ${absC.toEquationString()}) = ${d.toEquationString()}`;
            // a(bx + c) = d => abx + ac = d => abx = d - ac => x = (d - ac) / ab
            answer = d.subtract(a.multiply(c)).divide(a.multiply(b));
            break;

        default:
            equation = 'Invalid level';
            answer = new Fraction(0);
            break;
    }

    return { equation: equation, answer: answer };
}

// Export for use in other modules
export { generateEquation, Fraction };

