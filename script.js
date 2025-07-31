document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const topScreen = document.getElementById('top-screen');
    const learningScreen = document.getElementById('learning-screen');
    const recordsScreen = document.getElementById('records-screen');

    const startCommonDenominatorBtn = document.getElementById('start-common-denominator-btn');
    const startReductionBtn = document.getElementById('start-reduction-btn');
    const startDrillBtn = document.getElementById('start-drill-btn');
    const showRecordsBtn = document.getElementById('show-records-btn');
    const backToTopBtns = document.querySelectorAll('.back-to-top-btn');

    // Learning Screen UI Elements
    const stepText = document.getElementById('step-text');
    const fractionDisplay = document.getElementById('fraction-display');
    const guidanceText = document.getElementById('guidance-text');

    const step1Ui = document.getElementById('step-1-ui');
    const s1NumberButtons = document.getElementById('s1-number-buttons');

    const step2Ui = document.getElementById('step-2-ui');
    const lcmInput = document.getElementById('lcm-input');
    const checkLcmBtn = document.getElementById('check-lcm-btn');

    const step3Ui = document.getElementById('step-3-ui');
    const multiplierContainer = step3Ui.querySelector('.multiplier-container');
    const checkMultipliersBtn = document.getElementById('check-multipliers-btn');

    const step4Ui = document.getElementById('step-4-ui');
    const newFractionContainer = step4Ui.querySelector('.new-fraction-container');
    const checkNewFractionsBtn = document.getElementById('check-new-fractions-btn');

    const step5Ui = document.getElementById('step-5-ui');
    const finalAnswerContainer = step5Ui.querySelector('.final-answer-container');
    const checkFinalAnswerBtn = document.getElementById('check-final-answer-btn');

    const completionMessage = document.getElementById('completion-message');

    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    const gameState = {
        mode: null, // 'common-denominator', 'reduction', 'drill'
        problem: null,
        step: 1,
        lcm: null,
        selectedDenominators: [],
    };

    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    function lcm(a, b) {
        return (a * b) / gcd(a, b);
    }

    function generateProblem() {
        // シンプルな問題を生成（例: 1/3 + 1/4）
        const num1 = 1;
        const den1 = 3;
        const num2 = 1;
        const den2 = 4;
        return {
            f1: { num: num1, den: den1 },
            f2: { num: num2, den: den2 },
            operator: '+'
        };
    }

    function renderFractionDisplay() {
        const problem = gameState.problem;
        fractionDisplay.innerHTML = `\\[ \\frac{${problem.f1.num}}{${problem.f1.den}} ${problem.operator} \\frac{${problem.f2.num}}{${problem.f2.den}} \\]`;
        if (window.MathJax) {
            window.MathJax.typesetPromise([fractionDisplay]);
        }
    }

    function showStep(stepNumber) {
        const allStepUis = document.querySelectorAll('.step-ui-container');
        allStepUis.forEach(ui => ui.classList.add('hidden'));

        switch (stepNumber) {
            case 1:
                step1Ui.classList.remove('hidden');
                break;
            case 2:
                step2Ui.classList.remove('hidden');
                break;
            case 3:
                step3Ui.classList.remove('hidden');
                break;
            case 4:
                step4Ui.classList.remove('hidden');
                break;
            case 5:
                step5Ui.classList.remove('hidden');
                break;
            case 'completion':
                completionMessage.classList.remove('hidden');
                break;
        }
    }

    function handleNumberClick(event, number) {
        if (gameState.mode === 'common-denominator' && gameState.step === 1) {
            if (gameState.selectedDenominators.includes(number)) return;

            gameState.selectedDenominators.push(number);
            event.target.classList.add('selected');

            if (gameState.selectedDenominators.length === 2) {
                const den1 = gameState.problem.f1.den;
                const den2 = gameState.problem.f2.den;
                if (gameState.selectedDenominators.sort((a, b) => a - b).join(',') === [den1, den2].sort((a, b) => a - b).join(',')) {
                    goToStep2();
                } else {
                    guidanceText.textContent = 'ちがうよ。もう一度、分母の数字を選んでみよう。';
                    setTimeout(() => {
                        gameState.selectedDenominators = [];
                        const buttons = s1NumberButtons.querySelectorAll('button');
                        buttons.forEach(btn => btn.classList.remove('selected'));
                        guidanceText.textContent = 'まずは、分母の数字を２つとも選んでみよう。';
                    }, 1500);
                }
            }
        }
    }

    function checkLcm() {
        const userAnswer = parseInt(lcmInput.value, 10);

        if (userAnswer === gameState.lcm) {
            guidanceText.textContent = '正解！ピンポーン！';
            goToStep3();
        } else {
            guidanceText.textContent = 'ちがうみたい。もう一度考えてみてね。';
            lcmInput.value = '';
        }
    }

    function goToStep2() {
        gameState.step = 2;
        const den1 = gameState.problem.f1.den;
        const den2 = gameState.problem.f2.den;
        gameState.lcm = lcm(den1, den2);
        stepText.textContent = '手順2: 最小公倍数を見つけよう！';
        guidanceText.textContent = `分母の${den1}と${den2}の最小公倍数は何かな？`;
        
        showStep(2);
    }

    function checkMultipliers() {
        const input1 = document.getElementById('multiplier1-input');
        const input2 = document.getElementById('multiplier2-input');

        const answer1 = parseInt(input1.value, 10);
        const answer2 = parseInt(input2.value, 10);

        const correct1 = parseInt(input1.dataset.correct, 10);
        const correct2 = parseInt(input2.dataset.correct, 10);

        if (answer1 === correct1 && answer2 === correct2) {
            guidanceText.textContent = '正解！よくできました！';
            goToStep4();
        } else {
            guidanceText.textContent = 'おしい！もう一度考えてみよう。';
        }
    }

    function goToStep3() {
        gameState.step = 3;
        stepText.textContent = '手順3: 新しい分母に合わせよう！';
        guidanceText.textContent = '分母を最小公倍数にするには、それぞれ何をかければいいかな？';
        
        const problem = gameState.problem;
        const lcm = gameState.lcm;

        const multiplier1 = lcm / problem.f1.den;
        const multiplier2 = lcm / problem.f2.den;

        multiplierContainer.innerHTML = `
            <div>
                <span>${problem.f1.den} × </span>
                <input type="number" id="multiplier1-input" data-correct="${multiplier1}">
                <span> = ${lcm}</span>
            </div>
            <div>
                <span>${problem.f2.den} × </span>
                <input type="number" id="multiplier2-input" data-correct="${multiplier2}">
                <span> = ${lcm}</span>
            </div>
        `;

        showStep(3);
    }

    function checkNewFractions() {
        const newNum1 = parseInt(document.getElementById('new-num1-input').value, 10);
        const newDen1 = parseInt(document.getElementById('new-den1-input').value, 10);
        const newNum2 = parseInt(document.getElementById('new-num2-input').value, 10);
        const newDen2 = parseInt(document.getElementById('new-den2-input').value, 10);

        const correctNewNum1 = parseInt(document.getElementById('new-num1-input').dataset.correct, 10);
        const correctNewDen1 = parseInt(document.getElementById('new-den1-input').dataset.correct, 10);
        const correctNewNum2 = parseInt(document.getElementById('new-num2-input').dataset.correct, 10);
        const correctNewDen2 = parseInt(document.getElementById('new-den2-input').dataset.correct, 10);

        if (newNum1 === correctNewNum1 && newDen1 === correctNewDen1 && newNum2 === correctNewNum2 && newDen2 === correctNewDen2) {
            guidanceText.textContent = 'その通り！完璧だ！';
            goToStep5();
        } else {
            guidanceText.textContent = 'どこか間違っているみたい。もう一度、計算してみよう。';
        }
    }

    function goToStep4() {
        gameState.step = 4;
        stepText.textContent = '手順4: 新しい分数を作ろう！';
        guidanceText.textContent = '分母と分子に同じ数をかけて、新しい分数を作ってみよう。';
        
        const problem = gameState.problem;
        const lcm = gameState.lcm;
        const multiplier1 = lcm / problem.f1.den;
        const multiplier2 = lcm / problem.f2.den;

        const newNum1 = problem.f1.num * multiplier1;
        const newNum2 = problem.f2.num * multiplier2;

        newFractionContainer.innerHTML = `
            <div class="fraction-conversion">
                <p>元の分数: \\[ \\frac{${problem.f1.num}}{${problem.f1.den}} \\]</p>
                新しい分子: <input type="number" id="new-num1-input" data-correct="${newNum1}">
                新しい分母: <input type="number" id="new-den1-input" data-correct="${lcm}">
            </div>
            <div class="fraction-conversion">
                <p>元の分数: \\[ \\frac{${problem.f2.num}}{${problem.f2.den}} \\]</p>
                新しい分子: <input type="number" id="new-num2-input" data-correct="${newNum2}">
                新しい分母: <input type="number" id="new-den2-input" data-correct="${lcm}">
            </div>
        `;

        if (window.MathJax) {
            window.MathJax.typesetPromise([newFractionContainer]);
        }

        showStep(4);
    }

    function checkFinalAnswer() {
        const finalNum = parseInt(document.getElementById('final-num-input').value, 10);
        const finalDen = parseInt(document.getElementById('final-den-input').value, 10);

        const correctFinalNum = parseInt(document.getElementById('final-num-input').dataset.correct, 10);
        const correctFinalDen = parseInt(document.getElementById('final-den-input').dataset.correct, 10);

        if (finalNum === correctFinalNum && finalDen === correctFinalDen) {
            guidanceText.textContent = 'おめでとう！通分マスターだ！';
            showStep('completion');
        } else {
            guidanceText.textContent = '残念！もう一度、計算してみよう。';
        }
    }

    function goToStep5() {
        gameState.step = 5;
        stepText.textContent = '手順5: 計算しよう！';
        guidanceText.textContent = '分母が同じになったら、あとは分子を足し算（引き算）するだけだよ！';
        
        const problem = gameState.problem;
        const lcm = gameState.lcm;
        const multiplier1 = lcm / problem.f1.den;
        const multiplier2 = lcm / problem.f2.den;
        const newNum1 = problem.f1.num * multiplier1;
        const newNum2 = problem.f2.num * multiplier2;

        const finalNum = newNum1 + newNum2; // Assuming operator is always +

        finalAnswerContainer.innerHTML = `
            <div class="final-calculation">
                <p>計算する式: \\[ \\frac{${newNum1}}{${lcm}} + \\frac{${newNum2}}{${lcm}} \\]</p>
                答えの分子: <input type="number" id="final-num-input" data-correct="${finalNum}">
                答えの分母: <input type="number" id="final-den-input" data-correct="${lcm}">
            </div>
        `;

        if (window.MathJax) {
            window.MathJax.typesetPromise([finalAnswerContainer]);
        }

        showStep(5);
    }

    async function initCommonDenominatorMode() {
        console.log('initCommonDenominatorMode called');
        gameState.mode = 'common-denominator';
        gameState.problem = generateProblem();
        gameState.step = 1;
        gameState.selectedDenominators = [];
        stepText.textContent = '手順1: 分母に着目しよう';
        guidanceText.textContent = 'まずは、分母の数字を２つとも選んでみよう。';
        await renderFractionDisplay(); // Wait for MathJax rendering

        s1NumberButtons.innerHTML = '';
        const denominators = [gameState.problem.f1.den, gameState.problem.f2.den];
        const otherNumbers = [2, 5, 6, 12]; 
        const allNumbers = [...new Set([...denominators, ...otherNumbers])].sort((a, b) => a - b);

        allNumbers.forEach(num => {
            const button = document.createElement('button');
            button.textContent = num;
            button.addEventListener('click', (e) => handleNumberClick(e, num));
            s1NumberButtons.appendChild(button);
        });

        showStep(1);
        console.log('initCommonDenominatorMode finished');
    }

    // Event Listeners for main buttons
    startCommonDenominatorBtn.addEventListener('click', async () => {
        console.log('startCommonDenominatorBtn clicked');
        showScreen('learning-screen');
        await initCommonDenominatorMode(); // Wait for initialization to complete
    });

    startReductionBtn.addEventListener('click', () => {
        showScreen('learning-screen');
        // TODO: 約分モードの初期化処理
    });

    startDrillBtn.addEventListener('click', () => {
        showScreen('learning-screen');
        // TODO: ドリルモードの初期化処理
    });

    showRecordsBtn.addEventListener('click', () => {
        showScreen('records-screen');
        // TODO: 記録画面の表示処理
    });

    backToTopBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen('top-screen');
        });
    });

    // Event Listeners for step-specific buttons
    checkLcmBtn.addEventListener('click', checkLcm);
    checkMultipliersBtn.addEventListener('click', checkMultipliers);
    checkNewFractionsBtn.addEventListener('click', checkNewFractions);
    checkFinalAnswerBtn.addEventListener('click', checkFinalAnswer);

    // Initial screen display
    showScreen('top-screen');
});