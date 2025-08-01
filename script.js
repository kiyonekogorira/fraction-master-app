document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const screens = document.querySelectorAll('.screen');
    const learningScreen = document.getElementById('learning-screen');

    // Buttons
    const startCommonDenominatorBtn = document.getElementById('start-common-denominator-btn');
    const startReductionBtn = document.getElementById('start-reduction-btn');
    const startDrillBtn = document.getElementById('start-drill-btn');
    const showRecordsBtn = document.getElementById('show-records-btn');
    const backToTopBtns = document.querySelectorAll('.back-to-top-btn');
    const checkLcmBtn = document.getElementById('check-lcm-btn');
    const checkMultipliersBtn = document.getElementById('check-multipliers-btn');
    const checkNewFractionsBtn = document.getElementById('check-new-fractions-btn');
    const checkFinalAnswerBtn = document.getElementById('check-final-answer-btn');

    // Learning Screen UI
    const stepText = document.getElementById('step-text');
    const fractionDisplay = document.getElementById('fraction-display');
    const guidanceText = document.getElementById('guidance-text');
    const completionMessage = document.getElementById('completion-message');

    // Step UI Containers
    const stepUiContainers = document.querySelectorAll('.step-ui-container');
    const step1Ui = document.getElementById('step-1-ui');
    const s1NumberButtons = document.getElementById('s1-number-buttons');
    const step2Ui = document.getElementById('step-2-ui');
    const lcmInput = document.getElementById('lcm-input');
    const step3Ui = document.getElementById('step-3-ui');
    const multiplierContainer = step3Ui.querySelector('.multiplier-container');
    const step4Ui = document.getElementById('step-4-ui');
    const newFractionContainer = step4Ui.querySelector('.new-fraction-container');
    const step5Ui = document.getElementById('step-5-ui');
    const finalAnswerContainer = step5Ui.querySelector('.final-answer-container');

    // --- Game State ---
    const gameState = {
        mode: null, // 'common-denominator', 'reduction', 'drill'
        problem: null,
        step: 1,
        lcm: null,
        selectedDenominators: [],
    };

    // --- Utility Functions ---
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm = (a, b) => (a * b) / gcd(a, b);

    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function showStep(stepNumber) {
        stepUiContainers.forEach(ui => ui.classList.add('hidden'));
        const targetUi = document.getElementById(`step-${stepNumber}-ui`);
        if (targetUi) {
            targetUi.classList.remove('hidden');
        } else if (stepNumber === 'completion') {
            completionMessage.classList.remove('hidden');
        }
    }

    // --- Problem Generation ---
    function generateProblem() {
        const den1Options = [2, 3, 4, 5, 6];
        const den2Options = [3, 4, 5, 6, 7, 8];
        let den1, den2;

        // Ensure denominators are different
        do {
            den1 = den1Options[Math.floor(Math.random() * den1Options.length)];
            den2 = den2Options[Math.floor(Math.random() * den2Options.length)];
        } while (den1 === den2 || lcm(den1, den2) > 40); // Keep LCM manageable

        const num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
        const num2 = Math.floor(Math.random() * (den2 - 1)) + 1;

        return {
            f1: { num: num1, den: den1 },
            f2: { num: num2, den: den2 },
            operator: '+'
        };
    }

    // --- Rendering ---
    function renderFractionDisplay() {
        const { f1, f2, operator } = gameState.problem;
        fractionDisplay.innerHTML = `\[ \frac{${f1.num}}{${f1.den}} ${operator} \frac{${f2.num}}{${f2.den}} \]`;
        if (window.MathJax) {
            window.MathJax.typesetPromise([fractionDisplay]).catch(err => console.log(err));
        }
    }

    // --- Step Logic ---

    // Step 1: Select Denominators
    function initStep1() {
        gameState.step = 1;
        gameState.selectedDenominators = [];
        stepText.textContent = '手順1: 分母に着目しよう';
        guidanceText.textContent = 'まずは、問題の分母の数字を２つとも選んでみよう。';

        s1NumberButtons.innerHTML = '';
        const { den1, den2 } = gameState.problem.f1.den > gameState.problem.f2.den 
            ? { den1: gameState.problem.f2.den, den2: gameState.problem.f1.den }
            : { den1: gameState.problem.f1.den, den2: gameState.problem.f2.den };

        const distractors = [den1 + 1, den2 + 1, lcm(den1, den2)];
        const allNumbers = [...new Set([den1, den2, ...distractors])].sort((a, b) => a - b);

        allNumbers.forEach(num => {
            const button = document.createElement('button');
            button.textContent = num;
            button.addEventListener('click', (e) => handleNumberClick(e, num));
            s1NumberButtons.appendChild(button);
        });

        showStep(1);
    }

    function handleNumberClick(event, number) {
        if (gameState.step !== 1 || gameState.selectedDenominators.includes(number)) return;

        gameState.selectedDenominators.push(number);
        event.target.classList.add('selected');

        if (gameState.selectedDenominators.length === 2) {
            const { den1, den2 } = gameState.problem.f1;
            const selected = gameState.selectedDenominators.sort((a, b) => a - b);
            const correct = [den1, den2].sort((a, b) => a - b);

            if (selected.join(',') === correct.join(',')) {
                guidanceText.textContent = '正解！分母を選べたね。';
                setTimeout(initStep2, 1000);
            } else {
                guidanceText.textContent = 'ちがうよ。もう一度、分母の数字を選んでみよう。';
                setTimeout(() => {
                    gameState.selectedDenominators = [];
                    s1NumberButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
                    guidanceText.textContent = 'まずは、問題の分母の数字を２つとも選んでみよう。';
                }, 1500);
            }
        }
    }

    // Step 2: Find LCM
    function initStep2() {
        gameState.step = 2;
        const { den1, den2 } = gameState.problem.f1;
        gameState.lcm = lcm(den1, den2);
        stepText.textContent = '手順2: 最小公倍数を見つけよう！';
        guidanceText.textContent = `分母の${den1}と${den2}の最小公倍数は何かな？ヒント：九九を思い出そう！`;
        lcmInput.value = '';
        showStep(2);
        lcmInput.focus();
    }

    function checkLcm() {
        const userAnswer = parseInt(lcmInput.value, 10);
        if (userAnswer === gameState.lcm) {
            guidanceText.textContent = 'ピンポーン！正解！';
            setTimeout(initStep3, 1000);
        } else {
            guidanceText.textContent = 'ちがうみたい。もう一度考えてみてね。';
            lcmInput.value = '';
        }
    }

    // Step 3: Find Multipliers
    function initStep3() {
        gameState.step = 3;
        stepText.textContent = '手順3: 新しい分母に合わせよう！';
        guidanceText.textContent = '分母を最小公倍数にするには、それぞれ何をかければいいかな？';
        
        const { f1, f2 } = gameState.problem;
        const { lcm } = gameState;
        const multiplier1 = lcm / f1.den;
        const multiplier2 = lcm / f2.den;

        multiplierContainer.innerHTML = `
            <div class="multiplier-group">
                <span>\( \frac{${f1.num}}{${f1.den}} \) の分母と分子に何をかける？ </span>
                <input type="number" class="multiplier-input" id="multiplier1-input" data-correct="${multiplier1}">
            </div>
            <div class="multiplier-group">
                <span>\( \frac{${f2.num}}{${f2.den}} \) の分母と分子に何をかける？ </span>
                <input type="number" class="multiplier-input" id="multiplier2-input" data-correct="${multiplier2}">
            </div>
        `;
        if (window.MathJax) {
            window.MathJax.typesetPromise([multiplierContainer]).catch(err => console.log(err));
        }
        showStep(3);
    }

    function checkMultipliers() {
        const input1 = document.getElementById('multiplier1-input');
        const input2 = document.getElementById('multiplier2-input');
        const answer1 = parseInt(input1.value, 10);
        const answer2 = parseInt(input2.value, 10);
        const correct1 = parseInt(input1.dataset.correct, 10);
        const correct2 = parseInt(input2.dataset.correct, 10);

        if (answer1 === correct1 && answer2 === correct2) {
            guidanceText.textContent = '正解！分母と分子に同じ数をかけるのが大事なルールだよ。';
            setTimeout(initStep4, 1500);
        } else {
            guidanceText.textContent = 'おしい！もう一度考えてみよう。';
        }
    }

    // Step 4: Create New Fractions
    function initStep4() {
        gameState.step = 4;
        stepText.textContent = '手順4: 新しい分数を作ろう！';
        guidanceText.textContent = '分母と分子に同じ数をかけて、新しい分数を作ってみよう。';
        
        const { f1, f2 } = gameState.problem;
        const { lcm } = gameState;
        const multiplier1 = lcm / f1.den;
        const multiplier2 = lcm / f2.den;
        const newNum1 = f1.num * multiplier1;
        const newNum2 = f2.num * multiplier2;

        newFractionContainer.innerHTML = `
            <div class="fraction-conversion">
                <span> \[ \frac{${f1.num}}{${f1.den}} = \frac{<input type='number' id='new-num1-input' data-correct='${newNum1}'>}{<input type='number' id='new-den1-input' data-correct='${lcm}'>} \]</span>
            </div>
            <div class="fraction-conversion">
                <span> \[ \frac{${f2.num}}{${f2.den}} = \frac{<input type='number' id='new-num2-input' data-correct='${newNum2}'>}{<input type='number' id='new-den2-input' data-correct='${lcm}'>} \]</span>
            </div>
        `;
        if (window.MathJax) {
            window.MathJax.typesetPromise([newFractionContainer]).catch(err => console.log(err));
        }
        showStep(4);
    }

    function checkNewFractions() {
        const getVal = id => parseInt(document.getElementById(id).value, 10);
        const getCorrect = id => parseInt(document.getElementById(id).dataset.correct, 10);

        if (getVal('new-num1-input') === getCorrect('new-num1-input') &&
            getVal('new-den1-input') === getCorrect('new-den1-input') &&
            getVal('new-num2-input') === getCorrect('new-num2-input') &&
            getVal('new-den2-input') === getCorrect('new-den2-input')) {
            guidanceText.textContent = 'その通り！完璧だ！';
            setTimeout(initStep5, 1000);
        } else {
            guidanceText.textContent = 'どこか間違っているみたい。もう一度、計算してみよう。';
        }
    }

    // Step 5: Final Calculation
    function initStep5() {
        gameState.step = 5;
        stepText.textContent = '手順5: 計算しよう！';
        guidanceText.textContent = '分母が同じになったら、あとは分子を足し算するだけだよ！';
        
        const { f1, f2, operator } = gameState.problem;
        const { lcm } = gameState;
        const newNum1 = f1.num * (lcm / f1.den);
        const newNum2 = f2.num * (lcm / f2.den);
        const finalNum = operator === '+' ? newNum1 + newNum2 : newNum1 - newNum2;

        finalAnswerContainer.innerHTML = `
            <div class="final-calculation">
                <span>\[ \frac{${newNum1}}{${lcm}} ${operator} \frac{${newNum2}}{${lcm}} = \frac{<input type='number' id='final-num-input' data-correct='${finalNum}'>}{<input type='number' id='final-den-input' data-correct='${lcm}'>} \]</span>
            </div>
        `;
        if (window.MathJax) {
            window.MathJax.typesetPromise([finalAnswerContainer]).catch(err => console.log(err));
        }
        showStep(5);
    }

    function checkFinalAnswer() {
        const finalNum = parseInt(document.getElementById('final-num-input').value, 10);
        const finalDen = parseInt(document.getElementById('final-den-input').value, 10);
        const correctFinalNum = parseInt(document.getElementById('final-num-input').dataset.correct, 10);
        const correctFinalDen = parseInt(document.getElementById('final-den-input').dataset.correct, 10);

        if (finalNum === correctFinalNum && finalDen === correctFinalDen) {
            guidanceText.textContent = 'おめでとう！通分マスターだ！';
            stepText.textContent = 'クリア！';
            showStep('completion');
        } else {
            guidanceText.textContent = '残念！もう一度、計算してみよう。';
        }
    }

    // --- Mode Initialization ---
    function initCommonDenominatorMode() {
        gameState.mode = 'common-denominator';
        gameState.problem = generateProblem();
        renderFractionDisplay();
        initStep1();
        showScreen('learning-screen');
    }

    // --- Event Listeners ---
    startCommonDenominatorBtn.addEventListener('click', initCommonDenominatorMode);
    startReductionBtn.addEventListener('click', () => alert('この機能はまだ作られていません。'));
    startDrillBtn.addEventListener('click', () => alert('この機能はまだ作られていません。'));
    showRecordsBtn.addEventListener('click', () => showScreen('records-screen'));
    
    backToTopBtns.forEach(btn => {
        btn.addEventListener('click', () => showScreen('top-screen'));
    });

    checkLcmBtn.addEventListener('click', checkLcm);
    checkMultipliersBtn.addEventListener('click', checkMultipliers);
    checkNewFractionsBtn.addEventListener('click', checkNewFractions);
    checkFinalAnswerBtn.addEventListener('click', checkFinalAnswer);

    // --- Initial Load ---
    showScreen('top-screen');
});