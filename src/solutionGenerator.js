/**
 * solutionGenerator.js
 * 用於根據方程式生成詳細的解題步驟。
 */

import { Fraction } from './equationGenerator.js';

function generateSolution(equationObj) {
    const equationStr = equationObj.equation;
    const finalAnswer = equationObj.answer;
    let steps = [];

    // 步驟 1: 原始方程式
    steps.push({ type: 'text', content: '原始方程式:' });
    steps.push({ type: 'math', content: equationStr });

    // 根據方程式的特徵來生成詳細步驟
    // 檢查是否包含括號 (等級五)
    if (equationStr.includes('(') && equationStr.includes(')')) {
        // 解析括號方程式: a(bx + c) = d
        const match = equationStr.match(/([^()]+)\(([^()]+)\)\s*=\s*(.+)/);
        if (match) {
            const a = match[1].trim();
            const inside = match[2].trim();
            const d = match[3].trim();
            
            steps.push({ type: 'text', content: '步驟 1: 使用分配律展開括號' });
            steps.push({ type: 'math', content: `${a}(${inside}) = ${d}` });
            steps.push({ type: 'math', content: `${a} \\cdot ${inside.split('x')[0]}x + ${a} \\cdot ${inside.split('x')[1].replace(/[+\-]/g, '').trim()} = ${d}` });
            
            steps.push({ type: 'text', content: '步驟 2: 合併同類項' });
            steps.push({ type: 'text', content: '步驟 3: 將常數項移到等號右邊' });
            steps.push({ type: 'text', content: '步驟 4: 將 x 的係數移到等號右邊 (兩邊同除以係數)' });
        }
    }
    // 檢查是否兩邊都有 x (等級四)
    else if (equationStr.split('=')[0].includes('x') && equationStr.split('=')[1].includes('x')) {
        const [left, right] = equationStr.split('=');
        
        steps.push({ type: 'text', content: '步驟 1: 將含 x 的項移到等號左邊' });
        steps.push({ type: 'math', content: `${left} = ${right}` });
        
        steps.push({ type: 'text', content: '步驟 2: 將常數項移到等號右邊' });
        steps.push({ type: 'text', content: '步驟 3: 合併同類項' });
        steps.push({ type: 'text', content: '步驟 4: 將 x 的係數移到等號右邊 (兩邊同除以係數)' });
    }
    // 檢查是否有加減和乘除 (等級三)
    else if ((equationStr.includes('+') || equationStr.includes('-')) && 
             (equationStr.match(/\d+x/) || equationStr.match(/\\frac{x}/))) {
        const [left, right] = equationStr.split('=');
        
        steps.push({ type: 'text', content: '步驟 1: 將常數項移到等號右邊' });
        steps.push({ type: 'math', content: `${left} = ${right}` });
        
        // 簡化後的方程式
        const simplifiedLeft = left.replace(/[+\-]\s*\d+/g, '').trim();
        const constant = left.match(/[+\-]\s*\d+/);
        if (constant) {
            const newRight = constant[0].startsWith('+') ? 
                `${right} - ${constant[0].substring(1).trim()}` : 
                `${right} + ${constant[0].substring(1).trim()}`;
            steps.push({ type: 'math', content: `${simplifiedLeft} = ${newRight}` });
        }
        
        steps.push({ type: 'text', content: '步驟 2: 將 x 的係數移到等號右邊 (兩邊同除以係數)' });
    }
    // 等級二: 單步乘除
    else if (equationStr.match(/\d+x/) || equationStr.match(/\\frac{x}/)) {
        if (equationStr.includes('\\frac{x}')) {
            // 除法形式: x/a = b
            const match = equationStr.match(/\\frac\{x\}\{([^}]+)\}\s*=\s*(.+)/);
            if (match) {
                const a = match[1];
                const b = match[2];
                
                steps.push({ type: 'text', content: '步驟 1: 將分母移到等號右邊 (兩邊同乘以分母)' });
                steps.push({ type: 'math', content: `\\frac{x}{${a}} = ${b}` });
                steps.push({ type: 'math', content: `x = ${b} \\times ${a}` });
            }
        } else {
            // 乘法形式: ax = b
            const match = equationStr.match(/([^x]+)x\s*=\s*(.+)/);
            if (match) {
                const a = match[1].trim();
                const b = match[2].trim();
                
                steps.push({ type: 'text', content: '步驟 1: 將 x 的係數移到等號右邊 (兩邊同除以係數)' });
                steps.push({ type: 'math', content: `${a}x = ${b}` });
                steps.push({ type: 'math', content: `x = \\frac{${b}}{${a}}` });
            }
        }
    }
    // 等級一: 單步加減
    else {
        if (equationStr.includes('+')) {
            // 加法形式: x + a = b
            const match = equationStr.match(/x\s*\+\s*([^=]+)\s*=\s*(.+)/);
            if (match) {
                const a = match[1].trim();
                const b = match[2].trim();
                
                steps.push({ type: 'text', content: '步驟 1: 將常數項移到等號右邊 (兩邊同減)' });
                steps.push({ type: 'math', content: `x + ${a} = ${b}` });
                steps.push({ type: 'math', content: `x = ${b} - ${a}` });
            }
        } else if (equationStr.includes('-')) {
            // 減法形式: x - a = b
            const match = equationStr.match(/x\s*-\s*([^=]+)\s*=\s*(.+)/);
            if (match) {
                const a = match[1].trim();
                const b = match[2].trim();
                
                steps.push({ type: 'text', content: '步驟 1: 將常數項移到等號右邊 (兩邊同加)' });
                steps.push({ type: 'math', content: `x - ${a} = ${b}` });
                steps.push({ type: 'math', content: `x = ${b} + ${a}` });
            }
        }
    }

    // 最後一步: 顯示答案
    steps.push({ type: 'text', content: '最終答案:' });
    steps.push({ type: 'math', content: `x = ${finalAnswer.toEquationString()}` });

    return steps;
}

export { generateSolution };

